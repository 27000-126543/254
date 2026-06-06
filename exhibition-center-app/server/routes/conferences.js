const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { status, industry } = req.query;
  
  let query = 'SELECT * FROM conferences WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (industry && industry !== 'all') {
    query += ' AND industry = ?';
    params.push(industry);
  }

  const conferences = db.prepare(query).all(...params);
  res.json(conferences);
});

router.get('/:id', authenticateToken, (req, res) => {
  const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);
  if (!conference) {
    return res.status(404).json({ error: '会议不存在' });
  }

  const assignments = db.prepare(`
    SELECT sa.*, u.username
    FROM seat_assignments sa
    JOIN users u ON sa.user_id = u.id
    WHERE sa.conference_id = ?
    ORDER BY sa.registered_at ASC
  `).all(req.params.id);

  const myAssignment = assignments.find(a => a.user_id === req.user.id);

  res.json({ ...conference, seatAssignments: assignments, mySeat: myAssignment });
});

router.post('/:id/register', authenticateToken, (req, res) => {
  const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);
  if (!conference) {
    return res.status(404).json({ error: '会议不存在' });
  }

  if (conference.status !== 'upcoming') {
    return res.status(400).json({ error: '该会议已开始或已结束' });
  }

  const existing = db.prepare('SELECT id FROM seat_assignments WHERE conference_id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (existing) {
    return res.status(400).json({ error: '您已报名此会议' });
  }

  if (conference.registered_count >= conference.total_seats) {
    return res.status(400).json({ error: '该会议名额已满' });
  }

  const levelPriority = { diamond: 0, gold: 1, silver: 2 };
  const userPriority = levelPriority[req.user.member_level] || 2;
  
  const assignments = db.prepare(`
    SELECT sa.*, u.member_level
    FROM seat_assignments sa
    JOIN users u ON sa.user_id = u.id
    WHERE sa.conference_id = ?
    ORDER BY 
      CASE u.member_level 
        WHEN 'diamond' THEN 0 
        WHEN 'gold' THEN 1 
        ELSE 2 
      END ASC,
      sa.registered_at ASC
  `).all(req.params.id);

  let seatNumber;
  if (userPriority === 0) {
    const vipSeats = assignments.filter(a => a.seat_number.startsWith('V')).length;
    seatNumber = `V${String(vipSeats + 1).padStart(3, '0')}`;
  } else if (userPriority === 1) {
    const goldSeats = assignments.filter(a => a.seat_number.startsWith('G')).length;
    seatNumber = `G${String(goldSeats + 1).padStart(3, '0')}`;
  } else {
    const normalSeats = assignments.filter(a => a.seat_number.startsWith('A')).length;
    seatNumber = `A${String(normalSeats + 1).padStart(3, '0')}`;
  }

  const tx = db.transaction(() => {
    const assignmentId = uuidv4();
    db.prepare(`
      INSERT INTO seat_assignments (id, conference_id, user_id, seat_number, member_level)
      VALUES (?, ?, ?, ?, ?)
    `).run(assignmentId, req.params.id, req.user.id, seatNumber, req.user.member_level);

    db.prepare('UPDATE conferences SET registered_count = registered_count + 1 WHERE id = ?')
      .run(req.params.id);

    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type, read)
      VALUES (?, ?, ?, ?, 'success', 0)
    `).run(
      notificationId,
      req.user.id,
      '会议报名成功',
      `您已成功报名"${conference.title}"，座位号：${seatNumber}`
    );
  });

  try {
    tx();
    const updated = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);
    const mySeat = db.prepare('SELECT * FROM seat_assignments WHERE conference_id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    
    res.json({ success: true, conference: updated, seat: mySeat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '报名失败，请稍后重试' });
  }
});

module.exports = router;
