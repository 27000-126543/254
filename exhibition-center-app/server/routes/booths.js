const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, runTransaction, saveToDisk } = require('../db');
const { authenticateToken, requireRole, updateMemberLevel } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { hall, size, industry, status } = req.query;
  
  let query = 'SELECT * FROM booths WHERE 1=1';
  const params = [];

  if (hall && hall !== 'all') {
    query += ' AND hall = ?';
    params.push(hall);
  }
  if (size && size !== 'all') {
    query += ' AND size = ?';
    params.push(size);
  }
  if (industry && industry !== 'all') {
    query += ' AND industry = ?';
    params.push(industry);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  const booths = db.prepare(query).all(...params);
  
  const result = booths.map(b => ({
    ...b,
    position: { x: b.pos_x, y: b.pos_y }
  }));

  res.json(result);
});

router.get('/:id', authenticateToken, (req, res) => {
  const booth = db.prepare('SELECT * FROM booths WHERE id = ?').get(req.params.id);
  if (!booth) {
    return res.status(404).json({ error: '展位不存在' });
  }
  
  booth.position = { x: booth.pos_x, y: booth.pos_y };
  res.json(booth);
});

router.get('/recommend/list', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  const available = db.prepare(`
    SELECT b.*, 
      (CAST(b.historical_traffic AS REAL) / 4000) * 0.5 + 
      CASE WHEN b.industry = ? THEN 0.3 ELSE 0 END + 
      CASE WHEN b.area >= 36 THEN 0.2 ELSE 0 END AS score
    FROM booths b
    WHERE b.status = 'available'
    ORDER BY score DESC
    LIMIT 3
  `).all(exhibitor.industry);

  const result = available.map(b => ({
    ...b,
    position: { x: b.pos_x, y: b.pos_y },
    score: Math.round(b.score * 100)
  }));

  res.json(result);
});

router.post('/:id/reserve', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const booth = db.prepare('SELECT * FROM booths WHERE id = ?').get(req.params.id);
  if (!booth) {
    return res.status(404).json({ error: '展位不存在' });
  }

  if (booth.status !== 'available') {
    return res.status(400).json({ error: '该展位不可预订' });
  }

  if (req.user.balance < booth.price) {
    return res.status(400).json({ error: '余额不足，请先充值' });
  }

  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  try {
    const contractId = runTransaction(() => {
      db.prepare('UPDATE booths SET status = ?, exhibitor_id = ? WHERE id = ?')
        .run('reserved', exhibitor.id, req.params.id);

      db.prepare('UPDATE users SET balance = balance - ?, total_consumption = total_consumption + ? WHERE id = ?')
        .run(booth.price, booth.price, req.user.id);

      const contractId = uuidv4();
      const contractContent = `展位租赁合同

甲方（出租方）：国际会展中心
乙方（承租方）：${exhibitor.company_name}

一、展位信息
展位号：${booth.booth_number}
展馆：${booth.hall} ${booth.zone}
面积：${booth.area}平方米
展位用途：${booth.industry}产品展示

二、租赁期限
自2024年12月20日起至2024年12月23日止，共计4天。

三、费用及支付
展位租金：人民币${booth.price.toLocaleString()}元整
支付方式：从账户余额中扣除

四、双方权利与义务
1. 甲方保证场地符合展览标准，提供基本设施
2. 乙方应按时支付费用，遵守展馆管理规定
3. 乙方不得擅自转租、改变展位用途
4. 展会期间乙方应自行负责展品安全

五、违约责任
任何一方违约，应承担相应的违约责任。

六、争议解决
本合同履行过程中发生的争议，双方应友好协商解决。`;

      db.prepare(`
        INSERT INTO contracts (id, exhibitor_id, booth_id, amount, start_date, end_date, status, content)
        VALUES (?, ?, ?, ?, '2024-12-20', '2024-12-23', 'draft', ?)
      `).run(contractId, exhibitor.id, req.params.id, booth.price, contractContent);

      const notificationId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, content, type, read)
        VALUES (?, ?, ?, ?, 'success', 0)
      `).run(
        notificationId,
        req.user.id,
        '展位预订成功',
        `您已成功预订${booth.booth_number}展位，请及时确认电子合同`
      );

      updateMemberLevel(req.user.id);

      return contractId;
    });
    const updatedBooth = db.prepare('SELECT * FROM booths WHERE id = ?').get(req.params.id);
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(contractId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    delete user.password;

    res.json({
      success: true,
      booth: updatedBooth,
      contract,
      balance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '预订失败，请稍后重试' });
  }
});

router.post('/contract/:id/sign', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
  if (!contract) {
    return res.status(404).json({ error: '合同不存在' });
  }

  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor || contract.exhibitor_id !== exhibitor.id) {
    return res.status(403).json({ error: '无权操作此合同' });
  }

  if (contract.status !== 'draft') {
    return res.status(400).json({ error: '合同状态不正确' });
  }

  try {
    runTransaction(() => {
      db.prepare("UPDATE contracts SET status = 'signed', signed_at = datetime('now') WHERE id = ?")
        .run(req.params.id);

      db.prepare("UPDATE booths SET status = 'sold' WHERE id = ?")
        .run(contract.booth_id);

      const notificationId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, content, type, read)
        VALUES (?, ?, ?, ?, 'success', 0)
      `).run(
        notificationId,
        req.user.id,
        '合同签署完成',
        '展位合同已生效，祝您参展顺利！'
      );
    });
    const updatedContract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
    res.json({ success: true, contract: updatedContract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '签署失败，请稍后重试' });
  }
});

router.get('/my/contracts', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  const contracts = db.prepare(`
    SELECT c.*, b.booth_number, b.hall, b.zone, b.area
    FROM contracts c
    JOIN booths b ON c.booth_id = b.id
    WHERE c.exhibitor_id = ?
    ORDER BY c.created_at DESC
  `).all(exhibitor.id);

  res.json(contracts);
});

module.exports = router;
