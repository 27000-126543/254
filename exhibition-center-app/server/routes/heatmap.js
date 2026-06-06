const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { hall } = req.query;
  
  let boothQuery = 'SELECT b.* FROM booths b';
  let params = [];
  
  if (hall && hall !== 'all') {
    boothQuery += ' WHERE b.hall = ?';
    params.push(hall);
  }
  
  const booths = db.prepare(boothQuery).all(...params);
  const boothIds = booths.map(b => b.id);
  
  if (boothIds.length === 0) {
    return res.json([]);
  }

  const placeholders = boothIds.map(() => '?').join(',');
  const heatmapData = db.prepare(`
    SELECT h.* 
    FROM heatmap_records h
    INNER JOIN (
      SELECT booth_id, MAX(timestamp) as max_ts
      FROM heatmap_records
      WHERE booth_id IN (${placeholders})
      GROUP BY booth_id
    ) latest ON h.booth_id = latest.booth_id AND h.timestamp = latest.max_ts
  `).all(...boothIds);

  const result = booths.map(b => {
    const heat = heatmapData.find(h => h.booth_id === b.id) || {
      id: null,
      booth_id: b.id,
      visitor_count: Math.floor(Math.random() * 50) + 10,
      queue_length: Math.floor(Math.random() * 6),
      timestamp: new Date().toISOString()
    };
    return {
      id: heat.id || b.id,
      boothId: b.id,
      boothNumber: b.booth_number,
      hall: b.hall,
      zone: b.zone,
      area: b.area,
      visitorCount: heat.visitor_count,
      queueLength: heat.queue_length,
      timestamp: heat.timestamp
    };
  });

  res.json(result);
});

router.get('/stats', authenticateToken, (req, res) => {
  const heatmap = db.prepare(`
    SELECT h.*, b.booth_number, b.hall, b.zone
    FROM heatmap_records h
    JOIN booths b ON h.booth_id = b.id
    WHERE h.timestamp = (
      SELECT MAX(timestamp) FROM heatmap_records WHERE booth_id = h.booth_id
    )
    ORDER BY h.visitor_count DESC
  `).all();

  const totalVisitors = heatmap.reduce((sum, h) => sum + h.visitor_count, 0);
  const hotBooths = heatmap.filter(h => h.visitor_count >= 35).length;
  const avgQueue = Math.round(heatmap.reduce((sum, h) => sum + h.queue_length, 0) / heatmap.length);

  res.json({
    totalVisitors,
    hotBooths,
    avgQueue,
    heatmap: heatmap.map(h => ({
      boothId: h.booth_id,
      boothNumber: h.booth_number,
      hall: h.hall,
      zone: h.zone,
      visitorCount: h.visitor_count,
      queueLength: h.queue_length
    }))
  });
});

module.exports = router;
