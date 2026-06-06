const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, saveToDisk } = require('../db');
const { JWT_SECRET, authenticateToken, calculateMemberLevel, updateMemberLevel } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, email, phone, role, company, industry, interestedIndustries } = req.body;

  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: '请填写必填字段' });
  }

  if (!['exhibitor', 'visitor'].includes(role)) {
    return res.status(400).json({ error: '无效的用户角色' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existingUser) {
    return res.status(400).json({ error: '用户名或邮箱已存在' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const userId = uuidv4();

  db.prepare(`
    INSERT INTO users (id, username, password, email, phone, role, company, interested_industries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    username,
    hashedPassword,
    email,
    phone || '',
    role,
    company || null,
    interestedIndustries ? JSON.stringify(interestedIndustries) : null
  );

  if (role === 'exhibitor') {
    const exhibitorId = uuidv4();
    db.prepare(`
      INSERT INTO exhibitors (id, user_id, company_name, industry, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(exhibitorId, userId, company || '', industry || 'electronics', '');
  } else if (role === 'visitor') {
    const visitorId = uuidv4();
    db.prepare(`
      INSERT INTO visitors (id, user_id, name, interested_industries, ticket_code)
      VALUES (?, ?, ?, ?, ?)
    `).run(visitorId, userId, username, interestedIndustries ? JSON.stringify(interestedIndustries) : '[]', `TICKET${Date.now()}`);
  }

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  delete user.password;

  const levelInfo = calculateMemberLevel(user.total_consumption);

  res.json({
    token,
    user,
    memberInfo: levelInfo
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  updateMemberLevel(user.id);
  
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  delete updatedUser.password;

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const levelInfo = calculateMemberLevel(updatedUser.total_consumption);

  res.json({
    token,
    user: updatedUser,
    memberInfo: levelInfo
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  delete user.password;
  
  if (user.interested_industries) {
    user.interested_industries = JSON.parse(user.interested_industries);
  }

  const levelInfo = calculateMemberLevel(user.total_consumption);

  let profile = null;
  if (user.role === 'exhibitor') {
    profile = db.prepare('SELECT * FROM exhibitors WHERE user_id = ?').get(user.id);
    if (profile) {
      const products = db.prepare('SELECT * FROM products WHERE exhibitor_id = ?').all(profile.id);
      products.forEach(p => {
        if (p.tags) p.tags = JSON.parse(p.tags);
      });
      profile.products = products;
    }
  } else if (user.role === 'visitor') {
    profile = db.prepare('SELECT * FROM visitors WHERE user_id = ?').get(user.id);
    if (profile) {
      if (profile.interested_industries) {
        profile.interested_industries = JSON.parse(profile.interested_industries);
      }
      if (profile.visited_exhibitors) {
        profile.visited_exhibitors = JSON.parse(profile.visited_exhibitors);
      }
      if (profile.booked_meetings) {
        profile.booked_meetings = JSON.parse(profile.booked_meetings);
      }
    }
  }

  res.json({ user, profile, memberInfo: levelInfo });
});

router.put('/me', authenticateToken, (req, res) => {
  const { phone, email, company } = req.body;
  
  db.prepare(`
    UPDATE users SET phone = COALESCE(?, phone), email = COALESCE(?, email), company = COALESCE(?, company)
    WHERE id = ?
  `).run(phone || null, email || null, company || null, req.user.id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  delete user.password;

  res.json(user);
});

router.post('/recharge', authenticateToken, (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '充值金额必须大于0' });
  }

  db.prepare(`
    UPDATE users SET balance = balance + ?, member_points = member_points + ?
    WHERE id = ?
  `).run(amount, amount, req.user.id);

  const notificationId = uuidv4();
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, content, type, read)
    VALUES (?, ?, ?, ?, 'success', 0)
  `).run(
    notificationId,
    req.user.id,
    '充值成功',
    `成功充值¥${amount}，会员积分+${amount}`
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  delete user.password;

  res.json({ success: true, balance: user.balance, memberPoints: user.member_points });
});

module.exports = router;
