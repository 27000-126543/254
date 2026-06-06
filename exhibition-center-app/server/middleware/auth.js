const jwt = require('jsonwebtoken');
const { db, saveToDisk } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'exhibition-center-secret-key-2024';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '令牌无效或已过期' });
    }
    
    const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.userId);
    if (!dbUser) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    req.user = dbUser;
    next();
  });
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};

const calculateMemberLevel = (totalConsumption) => {
  if (totalConsumption >= 50000) {
    return { level: 'diamond', nextThreshold: null, pointsToNext: 0 };
  } else if (totalConsumption >= 10000) {
    return { level: 'gold', nextThreshold: 50000, pointsToNext: 50000 - totalConsumption };
  } else {
    return { level: 'silver', nextThreshold: 10000, pointsToNext: 10000 - totalConsumption };
  }
};

const updateMemberLevel = (userId) => {
  const user = db.prepare('SELECT total_consumption, member_level FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const { level } = calculateMemberLevel(user.total_consumption);
  if (level !== user.member_level) {
    db.prepare('UPDATE users SET member_level = ? WHERE id = ?').run(level, userId);
    const notificationId = require('uuid').v4();
    const levelNames = { silver: '银卡', gold: '金卡', diamond: '钻石卡' };
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type, read)
      VALUES (?, ?, ?, ?, 'success', 0)
    `).run(
      notificationId,
      userId,
      '会员等级升级',
      `恭喜！您的会员等级已升级为${levelNames[level]}，享受更多专属权益`,
    );
    saveToDisk();
  }
  return level;
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole,
  calculateMemberLevel,
  updateMemberLevel
};
