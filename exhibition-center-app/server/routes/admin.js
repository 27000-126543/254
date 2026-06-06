const express = require('express');
const { db } = require('../db');
const { authenticateToken, requireRole, calculateMemberLevel } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', authenticateToken, requireRole('admin'), (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalExhibitors = db.prepare('SELECT COUNT(*) as count FROM exhibitors').get().count;
  const totalVisitors = db.prepare('SELECT COUNT(*) as count FROM visitors').get().count;
  const totalBooths = db.prepare('SELECT COUNT(*) as count FROM booths').get().count;
  const soldBooths = db.prepare("SELECT COUNT(*) as count FROM booths WHERE status IN ('reserved', 'sold')").get().count;
  const totalConferences = db.prepare('SELECT COUNT(*) as count FROM conferences').get().count;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status = ?').get('paid').sum;
  const contractRevenue = db.prepare('SELECT COALESCE(SUM(amount), 0) as sum FROM contracts WHERE status = ?').get('signed').sum;

  res.json({
    totalUsers,
    totalExhibitors,
    totalVisitors,
    totalBooths,
    soldBooths,
    salesRate: Math.round((soldBooths / totalBooths) * 100),
    totalConferences,
    totalRevenue: totalRevenue + contractRevenue,
    contractRevenue,
    foodRevenue: totalRevenue,
    boothUtilization: Math.round((soldBooths / totalBooths) * 100)
  });
});

router.get('/daily-stats', authenticateToken, requireRole('admin'), (req, res) => {
  const stats = [];
  const baseDate = new Date('2024-12-15');
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    stats.push({
      date: dateStr,
      totalVisitors: Math.floor(10000 + Math.random() * 15000),
      totalExhibitors: Math.floor(300 + Math.random() * 80),
      totalRevenue: Math.floor(2000000 + Math.random() * 3000000),
      foodSales: Math.floor(150000 + Math.random() * 200000),
      conferenceAttendance: Math.floor(2000 + Math.random() * 3000)
    });
  }

  res.json(stats);
});

router.get('/exhibitors', authenticateToken, requireRole('admin'), (req, res) => {
  const exhibitors = db.prepare(`
    SELECT e.*, u.username, u.email, u.member_level, u.balance, u.total_consumption,
           b.booth_number, b.hall, b.zone
    FROM exhibitors e
    JOIN users u ON e.user_id = u.id
    LEFT JOIN booths b ON e.id = b.exhibitor_id
  `).all();

  const result = exhibitors.map(e => ({
    ...e,
    memberInfo: calculateMemberLevel(e.total_consumption)
  }));

  res.json(result);
});

router.get('/industry-trends', authenticateToken, requireRole('admin'), (req, res) => {
  const industries = ['electronics', 'machinery', 'textile', 'food', 'medical', 'automotive', 'building', 'energy'];
  const growthRates = [15.2, 6.2, 3.8, 10.5, 18.5, 8.7, -2.1, 22.3];
  const suggestedPrices = [38000, 30000, 22000, 28000, 35000, 32000, 20000, 36000];

  const trends = industries.map((ind, i) => ({
    industry: ind,
    growthRate: growthRates[i],
    predictedPopularity: Math.min(100, Math.floor(50 + growthRates[i] * 2 + Math.random() * 20)),
    suggestedPrice: suggestedPrices[i]
  }));

  res.json(trends);
});

router.get('/reports/monthly', authenticateToken, requireRole('admin'), (req, res) => {
  const { month = '2024-12' } = req.query;

  const halls = [
    { hall: '1号馆', revenue: 8500000, exhibitors: 125, satisfaction: 4.7, salesRate: 85 },
    { hall: '2号馆', revenue: 6800000, exhibitors: 98, satisfaction: 4.5, salesRate: 78 },
    { hall: '3号馆', revenue: 7200000, exhibitors: 105, satisfaction: 4.6, salesRate: 82 },
    { hall: '4号馆', revenue: 5200000, exhibitors: 72, satisfaction: 4.4, salesRate: 72 },
  ];

  const summary = {
    month,
    totalRevenue: halls.reduce((s, h) => s + h.revenue, 0),
    totalExhibitors: halls.reduce((s, h) => s + h.exhibitors, 0),
    avgSatisfaction: (halls.reduce((s, h) => s + h.satisfaction, 0) / halls.length).toFixed(1),
    avgSalesRate: Math.round(halls.reduce((s, h) => s + h.salesRate, 0) / halls.length),
    visitorConversion: 28.5,
    conferenceParticipation: 72.3,
    hallDetails: halls
  };

  res.json(summary);
});

module.exports = router;
