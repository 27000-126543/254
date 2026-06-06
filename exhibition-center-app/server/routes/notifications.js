const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { unread } = req.query;
  
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [req.user.id];

  if (unread === 'true') {
    query += ' AND read = 0';
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const notifications = db.prepare(query).all(...params);
  
  notifications.forEach(n => {
    n.read = n.read === 1;
  });

  res.json(notifications);
});

router.put('/:id/read', authenticateToken, (req, res) => {
  const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  if (!notification) {
    return res.status(404).json({ error: '通知不存在' });
  }

  if (notification.user_id !== req.user.id) {
    return res.status(403).json({ error: '无权操作此通知' });
  }

  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.put('/read-all', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ success: true });
});

router.get('/unread-count', authenticateToken, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0')
    .get(req.user.id).count;
  res.json({ count });
});

module.exports = router;
