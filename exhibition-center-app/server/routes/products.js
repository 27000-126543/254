const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/my', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  const products = db.prepare('SELECT * FROM products WHERE exhibitor_id = ?').all(exhibitor.id);
  const result = products.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : []
  }));

  res.json(result);
});

router.post('/', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const { name, description, category, tags, price } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '产品名称不能为空' });
  }

  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  const productId = uuidv4();
  db.prepare(`
    INSERT INTO products (id, exhibitor_id, name, description, category, tags, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    productId,
    exhibitor.id,
    name,
    description || '',
    category || '',
    tags ? JSON.stringify(tags) : '[]',
    price || ''
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  product.tags = product.tags ? JSON.parse(product.tags) : [];

  res.json(product);
});

router.put('/:id', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const { name, description, category, tags, price } = req.body;
  
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: '产品不存在' });
  }

  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor || product.exhibitor_id !== exhibitor.id) {
    return res.status(403).json({ error: '无权操作此产品' });
  }

  db.prepare(`
    UPDATE products SET 
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      tags = COALESCE(?, tags),
      price = COALESCE(?, price)
    WHERE id = ?
  `).run(
    name || null,
    description || null,
    category || null,
    tags ? JSON.stringify(tags) : null,
    price || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  updated.tags = updated.tags ? JSON.parse(updated.tags) : [];

  res.json(updated);
});

router.delete('/:id', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: '产品不存在' });
  }

  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor || product.exhibitor_id !== exhibitor.id) {
    return res.status(403).json({ error: '无权操作此产品' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/matches/potential-buyers', authenticateToken, requireRole('exhibitor'), (req, res) => {
  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  const buyers = db.prepare(`
    SELECT v.*, u.username, u.email, u.member_level, u.member_points
    FROM visitors v
    JOIN users u ON v.user_id = u.id
    WHERE v.interested_industries LIKE ?
  `).all(`%${exhibitor.industry}%`);

  const result = buyers.map(v => {
    const industries = v.interested_industries ? JSON.parse(v.interested_industries) : [];
    const matchScore = Math.min(100, 
      industries.length * 15 + 
      (v.member_points || 0) / 100 +
      Math.floor(Math.random() * 30)
    );
    return {
      visitor: v,
      user: { id: v.user_id, username: v.username, email: v.email, memberLevel: v.member_level },
      matchScore: Math.round(matchScore)
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);

  res.json(result);
});

router.get('/meetings/my', authenticateToken, (req, res) => {
  let meetings;
  
  if (req.user.role === 'exhibitor') {
    const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
    if (!exhibitor) return res.json([]);
    
    meetings = db.prepare(`
      SELECT m.*, v.name as visitor_name, u.email as visitor_email
      FROM business_meetings m
      JOIN visitors v ON m.visitor_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE m.exhibitor_id = ?
      ORDER BY m.scheduled_time DESC
    `).all(exhibitor.id);
  } else {
    const visitor = db.prepare('SELECT * FROM visitors WHERE user_id = ?').get(req.user.id);
    if (!visitor) return res.json([]);
    
    meetings = db.prepare(`
      SELECT m.*, e.company_name as exhibitor_name
      FROM business_meetings m
      JOIN exhibitors e ON m.exhibitor_id = e.id
      WHERE m.visitor_id = ?
      ORDER BY m.scheduled_time DESC
    `).all(visitor.id);
  }

  res.json(meetings);
});

router.post('/meetings', authenticateToken, (req, res) => {
  const { visitorId, productId, scheduledTime, location, notes } = req.body;
  
  if (req.user.role !== 'exhibitor') {
    return res.status(403).json({ error: '只有展商可以发起洽谈' });
  }

  const exhibitor = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(req.user.id);
  if (!exhibitor) {
    return res.status(404).json({ error: '展商信息不存在' });
  }

  const meetingId = uuidv4();
  db.prepare(`
    INSERT INTO business_meetings (id, exhibitor_id, visitor_id, product_id, scheduled_time, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    meetingId,
    exhibitor.id,
    visitorId,
    productId || null,
    scheduledTime,
    location || '商务洽谈区',
    notes || ''
  );

  const visitor = db.prepare('SELECT user_id FROM visitors WHERE id = ?').get(visitorId);
  if (visitor) {
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type, read)
      VALUES (?, ?, ?, ?, 'info', 0)
    `).run(
      notificationId,
      visitor.user_id,
      '商务洽谈邀请',
      `${exhibitor.company_name}邀请您预约商务洽谈`
    );
  }

  const meeting = db.prepare('SELECT * FROM business_meetings WHERE id = ?').get(meetingId);
  res.json(meeting);
});

router.put('/meetings/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  
  const meeting = db.prepare('SELECT * FROM business_meetings WHERE id = ?').get(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: '会议不存在' });
  }

  db.prepare('UPDATE business_meetings SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM business_meetings WHERE id = ?').get(req.params.id);
  
  res.json(updated);
});

module.exports = router;
