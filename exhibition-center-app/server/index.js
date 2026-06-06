const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '会展中心API服务运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

initDB()
  .then(() => {
    console.log('数据库初始化完成');
    
    const authRoutes = require('./routes/auth');
    const boothRoutes = require('./routes/booths');
    const productRoutes = require('./routes/products');
    const conferenceRoutes = require('./routes/conferences');
    const foodRoutes = require('./routes/food');
    const heatmapRoutes = require('./routes/heatmap');
    const notificationRoutes = require('./routes/notifications');
    const adminRoutes = require('./routes/admin');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/booths', boothRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/conferences', conferenceRoutes);
    app.use('/api/food', foodRoutes);
    app.use('/api/heatmap', heatmapRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/admin', adminRoutes);
    
    app.listen(PORT, () => {
      console.log(`
  ============================================
  🚀  国际会展中心后端服务已启动
  📍  服务地址: http://localhost:${PORT}
  🔗  API前缀: http://localhost:${PORT}/api
  ============================================
  
  📝 测试账号:
  • 管理员: admin / admin123
  • 展商: exhibitor1 / 123456
  • 观众: visitor1 / 123456
      `);
    });
  })
  .catch(err => {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  });
