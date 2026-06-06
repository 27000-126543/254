const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authenticateToken, updateMemberLevel } = require('../middleware/auth');

const router = express.Router();

router.get('/items', authenticateToken, (req, res) => {
  const { category } = req.query;
  
  let query = 'SELECT * FROM food_items WHERE available = 1';
  const params = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  const items = db.prepare(query).all(...params);
  res.json(items);
});

router.post('/order', authenticateToken, (req, res) => {
  const { items, paymentMethod = 'balance' } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: '订单不能为空' });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (paymentMethod === 'balance' && req.user.balance < totalAmount) {
    return res.status(400).json({ error: '余额不足，请先充值' });
  }

  const pickupCode = String(Math.floor(1000 + Math.random() * 9000));
  const orderId = uuidv4();

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (id, user_id, items, total_amount, status, payment_method, pickup_code)
      VALUES (?, ?, ?, ?, 'paid', ?, ?)
    `).run(
      orderId,
      req.user.id,
      JSON.stringify(items),
      totalAmount,
      paymentMethod,
      pickupCode
    );

    if (paymentMethod === 'balance') {
      db.prepare('UPDATE users SET balance = balance - ?, total_consumption = total_consumption + ? WHERE id = ?')
        .run(totalAmount, totalAmount, req.user.id);
    }

    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type, read)
      VALUES (?, ?, ?, ?, 'success', 0)
    `).run(
      notificationId,
      req.user.id,
      '点餐成功',
      `您的订单已支付，取餐码：${pickupCode}`
    );

    updateMemberLevel(req.user.id);
  });

  try {
    tx();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    order.items = JSON.parse(order.items);
    
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);
    
    res.json({ success: true, order, balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '下单失败，请稍后重试' });
  }
});

router.get('/orders/my', authenticateToken, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `).all(req.user.id);
  
  orders.forEach(o => {
    o.items = JSON.parse(o.items);
  });

  res.json(orders);
});

module.exports = router;
