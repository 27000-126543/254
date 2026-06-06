const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'exhibition.db');

const state = {
  db: null,
  SQL: null
};

function saveToDisk() {
  try {
    const data = state.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (e) {
    console.error('保存数据库失败:', e.message);
  }
}

function escapeParam(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'string') {
    return "'" + val.replace(/'/g, "''") + "'";
  }
  return String(val);
}

function execQuery(sql, params = []) {
  let processedSql = sql;
  let paramIdx = 0;
  processedSql = sql.replace(/\?/g, () => escapeParam(params[paramIdx++]));
  const result = state.db.exec(processedSql);
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

function patchDb() {
  const origPrepare = state.db.prepare.bind(state.db);
  state.db.prepare = function(sql) {
    const stmt = {
      _sql: sql,
      run: function(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        execQuery(sql, params);
        return { changes: state.db.getRowsModified() };
      },
      get: function(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const rows = execQuery(sql, params);
        return rows.length > 0 ? rows[0] : undefined;
      },
      all: function(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return execQuery(sql, params);
      }
    };
    return stmt;
  };
}

function runTransaction(fn) {
  state.db.exec('BEGIN');
  try {
    const result = fn();
    state.db.exec('COMMIT');
    saveToDisk();
    return result;
  } catch (e) {
    state.db.exec('ROLLBACK');
    throw e;
  }
}

async function initDB() {
  state.SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    try {
      const buffer = fs.readFileSync(dbPath);
      state.db = new state.SQL.Database(buffer);
    } catch (e) {
      console.error('加载数据库失败，重新创建:', e.message);
      state.db = new state.SQL.Database();
    }
  } else {
    state.db = new state.SQL.Database();
  }

  patchDb();

  state.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('exhibitor', 'visitor', 'admin')),
      company TEXT,
      avatar TEXT,
      member_level TEXT NOT NULL DEFAULT 'silver' CHECK(member_level IN ('silver', 'gold', 'diamond')),
      member_points INTEGER NOT NULL DEFAULT 0,
      exhibition_count INTEGER NOT NULL DEFAULT 0,
      total_consumption REAL NOT NULL DEFAULT 0,
      balance REAL NOT NULL DEFAULT 0,
      interested_industries TEXT,
      registered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS booths (
      id TEXT PRIMARY KEY,
      booth_number TEXT UNIQUE NOT NULL,
      area INTEGER NOT NULL,
      size TEXT NOT NULL,
      hall TEXT NOT NULL,
      zone TEXT NOT NULL,
      pos_x INTEGER NOT NULL DEFAULT 0,
      pos_y INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'reserved', 'sold')),
      industry TEXT NOT NULL,
      historical_traffic INTEGER NOT NULL DEFAULT 0,
      exhibitor_id TEXT,
      contract_url TEXT,
      FOREIGN KEY (exhibitor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS exhibitors (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      booth_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (booth_id) REFERENCES booths(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      exhibitor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      tags TEXT,
      images TEXT,
      price TEXT,
      FOREIGN KEY (exhibitor_id) REFERENCES exhibitors(id)
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      interested_industries TEXT,
      visited_exhibitors TEXT DEFAULT '[]',
      booked_meetings TEXT DEFAULT '[]',
      ticket_code TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS business_meetings (
      id TEXT PRIMARY KEY,
      exhibitor_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      product_id TEXT,
      scheduled_time TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (exhibitor_id) REFERENCES exhibitors(id),
      FOREIGN KEY (visitor_id) REFERENCES visitors(id)
    );

    CREATE TABLE IF NOT EXISTS conferences (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      speaker TEXT NOT NULL,
      speaker_avatar TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      total_seats INTEGER NOT NULL,
      registered_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'ongoing', 'ended')),
      industry TEXT NOT NULL,
      replay_url TEXT
    );

    CREATE TABLE IF NOT EXISTS seat_assignments (
      id TEXT PRIMARY KEY,
      conference_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      seat_number TEXT NOT NULL,
      member_level TEXT NOT NULL,
      registered_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (conference_id) REFERENCES conferences(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(conference_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('meal', 'snack', 'beverage', 'dessert')),
      image TEXT,
      available INTEGER NOT NULL DEFAULT 1,
      restaurant TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'preparing', 'ready', 'completed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      payment_method TEXT NOT NULL DEFAULT 'balance',
      pickup_code TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      exhibitor_id TEXT NOT NULL,
      booth_id TEXT NOT NULL,
      amount REAL NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'signed', 'cancelled')),
      content TEXT,
      signed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (exhibitor_id) REFERENCES exhibitors(id),
      FOREIGN KEY (booth_id) REFERENCES booths(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info', 'warning', 'success', 'promotion')),
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS heatmap_records (
      id TEXT PRIMARY KEY,
      booth_id TEXT NOT NULL,
      visitor_count INTEGER NOT NULL DEFAULT 0,
      queue_length INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booth_id) REFERENCES booths(id)
    );
  `);

  const userCountResult = state.db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = userCountResult && userCountResult[0] && userCountResult[0].values[0] ? userCountResult[0].values[0][0] : 0;
  
  if (userCount === 0) {
    console.log('初始化示例数据...');
    seedData();
  }
  
  saveToDisk();
}

function seedData() {
  const salt = bcrypt.genSaltSync(10);

  const adminId = uuidv4();
  const exhibitorId1 = uuidv4();
  const exhibitorId2 = uuidv4();
  const visitorId1 = uuidv4();

  const insertUser = state.db.prepare(`
    INSERT INTO users (id, username, password, email, phone, role, company, member_level, member_points, exhibition_count, total_consumption, balance, interested_industries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(adminId, 'admin', bcrypt.hashSync('admin123', salt), 'admin@exhibition.com', '15000150001', 'admin', null, 'diamond', 0, 0, 0, 0, null);
  insertUser.run(exhibitorId1, 'exhibitor1', bcrypt.hashSync('123456', salt), 'tech@example.com', '13800138001', 'exhibitor', '科技创新有限公司', 'gold', 8500, 8, 125000, 5000, null);
  insertUser.run(exhibitorId2, 'exhibitor2', bcrypt.hashSync('123456', salt), 'medical@example.com', '13800138002', 'exhibitor', '健康医疗科技', 'diamond', 25000, 15, 380000, 12000, null);
  insertUser.run(visitorId1, 'visitor1', bcrypt.hashSync('123456', salt), 'visitor@example.com', '13900139001', 'visitor', null, 'silver', 1200, 3, 8000, 500, '["electronics","medical"]');

  const exhibitor1Id = uuidv4();
  const exhibitor2Id = uuidv4();
  const visitor1 = uuidv4();

  const insertExhibitor = state.db.prepare(`
    INSERT INTO exhibitors (id, user_id, company_name, industry, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertExhibitor.run(exhibitor1Id, exhibitorId1, '科技创新有限公司', 'electronics', '专注于人工智能和物联网设备研发的高新技术企业');
  insertExhibitor.run(exhibitor2Id, exhibitorId2, '健康医疗科技', 'medical', '专业从事医疗设备研发生产，产品覆盖诊断、治疗、康复全流程');

  state.db.prepare(`
    INSERT INTO visitors (id, user_id, name, interested_industries, ticket_code)
    VALUES (?, ?, ?, ?, ?)
  `).run(visitor1, visitorId1, '张先生', '["electronics","medical"]', 'TICKET20240001');

  const insertProduct = state.db.prepare(`
    INSERT INTO products (id, exhibitor_id, name, description, category, tags, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertProduct.run(uuidv4(), exhibitor1Id, '智能工业传感器', '高精度工业级传感器，支持多种协议', '传感器', '["IoT","智能制造","工业4.0"]', '¥1,299');
  insertProduct.run(uuidv4(), exhibitor1Id, 'AI视觉检测系统', '基于深度学习的产品缺陷检测系统', 'AI系统', '["机器视觉","质量检测","AI"]', '¥58,000');
  insertProduct.run(uuidv4(), exhibitor1Id, '边缘计算网关', '工业级边缘计算设备，支持多协议转换', '网络设备', '["边缘计算","工业互联"]', '¥3,999');
  insertProduct.run(uuidv4(), exhibitor2Id, '便携式诊断仪', '多参数便携式医疗诊断设备', '诊断设备', '["便携","智能诊断","远程医疗"]', '¥12,800');
  insertProduct.run(uuidv4(), exhibitor2Id, '智能康复机器人', '辅助肢体康复训练的智能机器人', '康复设备', '["康复","机器人","智能"]', '¥128,000');

  const booths = [
    { num: 'A101', area: 36, size: '36', hall: '1号馆', zone: 'A区', price: 36000, industry: 'electronics', traffic: 2800, status: 'available' },
    { num: 'A102', area: 18, size: '18', hall: '1号馆', zone: 'A区', price: 20000, industry: 'electronics', traffic: 2200, status: 'available' },
    { num: 'A103', area: 54, size: '54', hall: '1号馆', zone: 'A区', price: 52000, industry: 'electronics', traffic: 3500, status: 'reserved', exhibitor_id: exhibitorId1 },
    { num: 'A201', area: 9, size: '9', hall: '1号馆', zone: 'A区', price: 10000, industry: 'electronics', traffic: 1500, status: 'available' },
    { num: 'B101', area: 36, size: '36', hall: '1号馆', zone: 'B区', price: 32000, industry: 'medical', traffic: 2600, status: 'sold', exhibitor_id: exhibitorId2 },
    { num: 'B102', area: 18, size: '18', hall: '1号馆', zone: 'B区', price: 18000, industry: 'medical', traffic: 2000, status: 'available' },
    { num: 'C101', area: 36, size: '36', hall: '2号馆', zone: 'C区', price: 34000, industry: 'machinery', traffic: 2400, status: 'available' },
    { num: 'C102', area: 54, size: '54', hall: '2号馆', zone: 'C区', price: 50000, industry: 'machinery', traffic: 3100, status: 'available' },
    { num: 'D101', area: 18, size: '18', hall: '2号馆', zone: 'D区', price: 16000, industry: 'textile', traffic: 1800, status: 'available' },
    { num: 'E101', area: 36, size: '36', hall: '3号馆', zone: 'E区', price: 30000, industry: 'food', traffic: 2900, status: 'available' },
    { num: 'F101', area: 54, size: '54', hall: '3号馆', zone: 'F区', price: 48000, industry: 'automotive', traffic: 3200, status: 'available' },
    { num: 'G101', area: 36, size: '36', hall: '4号馆', zone: 'G区', price: 33000, industry: 'energy', traffic: 2700, status: 'available' },
  ];

  const insertBooth = state.db.prepare(`
    INSERT INTO booths (id, booth_number, area, size, hall, zone, pos_x, pos_y, price, status, industry, historical_traffic, exhibitor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  booths.forEach((b, i) => {
    insertBooth.run(
      uuidv4(), b.num, b.area, b.size, b.hall, b.zone,
      (i % 6) + 1, Math.floor(i / 6) + 1,
      b.price, b.status, b.industry, b.traffic,
      b.exhibitor_id || null
    );
  });

  const insertConference = state.db.prepare(`
    INSERT INTO conferences (id, title, description, speaker, start_time, end_time, venue, total_seats, registered_count, status, industry)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertConference.run(uuidv4(), '2024智能制造高峰论坛', '邀请行业专家探讨智能制造发展趋势，分享最新技术应用案例', '李教授', '2024-12-20 09:00', '2024-12-20 12:00', '1号会议厅', 200, 156, 'upcoming', 'electronics');
  insertConference.run(uuidv4(), '医疗科技创新峰会', '聚焦数字医疗与人工智能在医疗领域的应用', '王院长', '2024-12-20 14:00', '2024-12-20 17:00', '2号会议厅', 150, 120, 'upcoming', 'medical');
  insertConference.run(uuidv4(), '新能源技术交流会', '探讨光伏、储能等新能源技术的最新进展', '陈博士', '2024-12-21 09:00', '2024-12-21 11:30', '3号会议厅', 180, 95, 'upcoming', 'energy');

  const insertFood = state.db.prepare(`
    INSERT INTO food_items (id, name, description, price, category, available, restaurant, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const foods = [
    { name: '商务套餐A', desc: '三荤两素一汤', price: 45, cat: 'meal', rest: '美食广场', loc: '1号馆2楼' },
    { name: '商务套餐B', desc: '两荤三素一汤', price: 38, cat: 'meal', rest: '美食广场', loc: '1号馆2楼' },
    { name: '牛肉面', desc: '红烧牛肉面', price: 32, cat: 'meal', rest: '面馆', loc: '2号馆1楼' },
    { name: '咖啡', desc: '现磨美式咖啡', price: 25, cat: 'beverage', rest: '咖啡厅', loc: '主入口大厅' },
    { name: '三明治', desc: '火腿芝士三明治', price: 22, cat: 'snack', rest: '咖啡厅', loc: '主入口大厅' },
    { name: '水果拼盘', desc: '新鲜时令水果', price: 35, cat: 'dessert', rest: '甜品站', loc: '3号馆1楼' },
    { name: '奶茶', desc: '珍珠奶茶', price: 18, cat: 'beverage', rest: '甜品站', loc: '3号馆1楼' },
    { name: '汉堡套餐', desc: '牛肉汉堡+薯条+可乐', price: 42, cat: 'meal', rest: '快餐店', loc: '2号馆2楼' },
  ];
  foods.forEach(f => {
    insertFood.run(uuidv4(), f.name, f.desc, f.price, f.cat, 1, f.rest, f.loc);
  });

  const boothIdsResult = state.db.exec('SELECT id FROM booths');
  const boothIds = boothIdsResult[0].values.map((row) => ({ id: row[0] }));
  
  const insertHeatmap = state.db.prepare(`
    INSERT INTO heatmap_records (id, booth_id, visitor_count, queue_length, timestamp)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  boothIds.forEach((b) => {
    insertHeatmap.run(uuidv4(), b.id, Math.floor(Math.random() * 60) + 10, Math.floor(Math.random() * 6));
  });

  const insertNotification = state.db.prepare(`
    INSERT INTO notifications (id, user_id, title, content, type, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertNotification.run(uuidv4(), exhibitorId1, '展位预订成功', '您已成功预订1号馆A103展位', 'success', 0);
  insertNotification.run(uuidv4(), exhibitorId1, '商务洽谈邀请', '有3位潜在买家希望与您预约洽谈', 'info', 0);
  insertNotification.run(uuidv4(), visitorId1, '会议报名成功', '您已成功报名"智能制造高峰论坛"', 'success', 1);

  console.log('示例数据初始化完成！');
  console.log('测试账号:');
  console.log('  管理员: admin / admin123');
  console.log('  展商: exhibitor1 / 123456');
  console.log('  观众: visitor1 / 123456');
}

module.exports = {
  get db() { return state.db; },
  initDB,
  saveToDisk,
  runTransaction
};
