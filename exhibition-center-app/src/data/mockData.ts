import type {
  User, Booth, Exhibitor, Product, Visitor, BusinessMeeting,
  Conference, FoodItem, Order, HeatMapData, DailyStats,
  Contract, IndustryTrend, Notification
} from '../types';

const industryNames: Record<string, string> = {
  electronics: '电子科技',
  machinery: '机械设备',
  textile: '纺织服装',
  food: '食品饮料',
  medical: '医疗器械',
  automotive: '汽车制造',
  building: '建筑建材',
  energy: '新能源'
};

export const industryList = [
  { value: 'electronics', label: '电子科技' },
  { value: 'machinery', label: '机械设备' },
  { value: 'textile', label: '纺织服装' },
  { value: 'food', label: '食品饮料' },
  { value: 'medical', label: '医疗器械' },
  { value: 'automotive', label: '汽车制造' },
  { value: 'building', label: '建筑建材' },
  { value: 'energy', label: '新能源' },
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'exhibitor1',
    password: '123456',
    email: 'tech@example.com',
    phone: '13800138001',
    role: 'exhibitor',
    company: '科技创新有限公司',
    memberLevel: 'gold',
    memberPoints: 8500,
    exhibitionCount: 8,
    totalConsumption: 125000,
    balance: 5000,
    registeredAt: '2024-01-15'
  },
  {
    id: 'u2',
    username: 'visitor1',
    password: '123456',
    email: 'visitor@example.com',
    phone: '13900139001',
    role: 'visitor',
    memberLevel: 'silver',
    memberPoints: 1200,
    exhibitionCount: 3,
    totalConsumption: 8000,
    balance: 500,
    interestedIndustries: ['electronics', 'medical'],
    registeredAt: '2024-06-20'
  },
  {
    id: 'u3',
    username: 'admin',
    password: 'admin123',
    email: 'admin@exhibition.com',
    phone: '15000150001',
    role: 'admin',
    memberLevel: 'diamond',
    memberPoints: 0,
    exhibitionCount: 0,
    totalConsumption: 0,
    registeredAt: '2023-01-01'
  },
  {
    id: 'u4',
    username: 'exhibitor2',
    password: '123456',
    email: 'medical@example.com',
    phone: '13800138002',
    role: 'exhibitor',
    company: '健康医疗科技',
    memberLevel: 'diamond',
    memberPoints: 25000,
    exhibitionCount: 15,
    totalConsumption: 380000,
    balance: 12000,
    registeredAt: '2022-08-10'
  }
];

export const mockBooths: Booth[] = [
  { id: 'b1', boothNumber: 'A101', area: 36, size: '36', hall: '1号馆', zone: 'A区', position: { x: 1, y: 1 }, price: 36000, status: 'available', industry: 'electronics', historicalTraffic: 2800 },
  { id: 'b2', boothNumber: 'A102', area: 18, size: '18', hall: '1号馆', zone: 'A区', position: { x: 2, y: 1 }, price: 20000, status: 'available', industry: 'electronics', historicalTraffic: 2200 },
  { id: 'b3', boothNumber: 'A103', area: 54, size: '54', hall: '1号馆', zone: 'A区', position: { x: 3, y: 1 }, price: 52000, status: 'reserved', industry: 'electronics', historicalTraffic: 3500, exhibitorId: 'e1' },
  { id: 'b4', boothNumber: 'A201', area: 9, size: '9', hall: '1号馆', zone: 'A区', position: { x: 1, y: 2 }, price: 10000, status: 'available', industry: 'electronics', historicalTraffic: 1500 },
  { id: 'b5', boothNumber: 'B101', area: 36, size: '36', hall: '1号馆', zone: 'B区', position: { x: 1, y: 3 }, price: 32000, status: 'sold', industry: 'medical', historicalTraffic: 2600, exhibitorId: 'e2' },
  { id: 'b6', boothNumber: 'B102', area: 18, size: '18', hall: '1号馆', zone: 'B区', position: { x: 2, y: 3 }, price: 18000, status: 'available', industry: 'medical', historicalTraffic: 2000 },
  { id: 'b7', boothNumber: 'C101', area: 36, size: '36', hall: '2号馆', zone: 'C区', position: { x: 1, y: 1 }, price: 34000, status: 'available', industry: 'machinery', historicalTraffic: 2400 },
  { id: 'b8', boothNumber: 'C102', area: 54, size: '54', hall: '2号馆', zone: 'C区', position: { x: 2, y: 1 }, price: 50000, status: 'available', industry: 'machinery', historicalTraffic: 3100 },
  { id: 'b9', boothNumber: 'D101', area: 18, size: '18', hall: '2号馆', zone: 'D区', position: { x: 1, y: 2 }, price: 16000, status: 'available', industry: 'textile', historicalTraffic: 1800 },
  { id: 'b10', boothNumber: 'E101', area: 36, size: '36', hall: '3号馆', zone: 'E区', position: { x: 1, y: 1 }, price: 30000, status: 'available', industry: 'food', historicalTraffic: 2900 },
  { id: 'b11', boothNumber: 'F101', area: 54, size: '54', hall: '3号馆', zone: 'F区', position: { x: 1, y: 2 }, price: 48000, status: 'available', industry: 'automotive', historicalTraffic: 3200 },
  { id: 'b12', boothNumber: 'G101', area: 36, size: '36', hall: '4号馆', zone: 'G区', position: { x: 1, y: 1 }, price: 33000, status: 'available', industry: 'energy', historicalTraffic: 2700 },
];

export const mockExhibitors: Exhibitor[] = [
  {
    id: 'e1',
    userId: 'u1',
    companyName: '科技创新有限公司',
    industry: 'electronics',
    description: '专注于人工智能和物联网设备研发的高新技术企业',
    products: [
      { id: 'p1', exhibitorId: 'e1', name: '智能工业传感器', description: '高精度工业级传感器，支持多种协议', category: '传感器', tags: ['IoT', '智能制造', '工业4.0'], price: '¥1,299' },
      { id: 'p2', exhibitorId: 'e1', name: 'AI视觉检测系统', description: '基于深度学习的产品缺陷检测系统', category: 'AI系统', tags: ['机器视觉', '质量检测', 'AI'], price: '¥58,000' },
      { id: 'p3', exhibitorId: 'e1', name: '边缘计算网关', description: '工业级边缘计算设备，支持多协议转换', category: '网络设备', tags: ['边缘计算', '工业互联'], price: '¥3,999' },
    ],
    boothId: 'b3',
    meetings: []
  },
  {
    id: 'e2',
    userId: 'u4',
    companyName: '健康医疗科技',
    industry: 'medical',
    description: '专业从事医疗设备研发生产，产品覆盖诊断、治疗、康复全流程',
    products: [
      { id: 'p4', exhibitorId: 'e2', name: '便携式诊断仪', description: '多参数便携式医疗诊断设备', category: '诊断设备', tags: ['便携', '智能诊断', '远程医疗'], price: '¥12,800' },
      { id: 'p5', exhibitorId: 'e2', name: '智能康复机器人', description: '辅助肢体康复训练的智能机器人', category: '康复设备', tags: ['康复', '机器人', '智能'], price: '¥128,000' },
    ],
    boothId: 'b5',
    meetings: []
  },
];

export const mockVisitors: Visitor[] = [
  {
    id: 'v1',
    userId: 'u2',
    name: '张先生',
    interestedIndustries: ['electronics', 'medical'],
    visitedExhibitors: ['e1'],
    bookedMeetings: [],
    ticketCode: 'TICKET20240001'
  }
];

export const mockMeetings: BusinessMeeting[] = [
  {
    id: 'm1',
    exhibitorId: 'e1',
    visitorId: 'v1',
    productId: 'p2',
    scheduledTime: '2024-12-20 10:00',
    location: '1号馆商务洽谈区A',
    status: 'confirmed',
    notes: '希望了解AI视觉检测系统的定制化方案'
  }
];

export const mockConferences: Conference[] = [
  {
    id: 'c1',
    title: '2024智能制造高峰论坛',
    description: '邀请行业专家探讨智能制造发展趋势，分享最新技术应用案例',
    speaker: '李教授',
    speakerAvatar: '',
    startTime: '2024-12-20 09:00',
    endTime: '2024-12-20 12:00',
    venue: '1号会议厅',
    totalSeats: 200,
    registeredCount: 156,
    status: 'upcoming',
    industry: 'electronics',
    seatAssignments: []
  },
  {
    id: 'c2',
    title: '医疗科技创新峰会',
    description: '聚焦数字医疗与人工智能在医疗领域的应用',
    speaker: '王院长',
    startTime: '2024-12-20 14:00',
    endTime: '2024-12-20 17:00',
    venue: '2号会议厅',
    totalSeats: 150,
    registeredCount: 120,
    status: 'upcoming',
    industry: 'medical',
    seatAssignments: []
  },
  {
    id: 'c3',
    title: '新能源技术交流会',
    description: '探讨光伏、储能等新能源技术的最新进展',
    speaker: '陈博士',
    startTime: '2024-12-21 09:00',
    endTime: '2024-12-21 11:30',
    venue: '3号会议厅',
    totalSeats: 180,
    registeredCount: 95,
    status: 'upcoming',
    industry: 'energy',
    seatAssignments: []
  },
];

export const mockFoodItems: FoodItem[] = [
  { id: 'f1', name: '商务套餐A', description: '三荤两素一汤', price: 45, category: 'meal', available: true, restaurant: '美食广场', location: '1号馆2楼' },
  { id: 'f2', name: '商务套餐B', description: '两荤三素一汤', price: 38, category: 'meal', available: true, restaurant: '美食广场', location: '1号馆2楼' },
  { id: 'f3', name: '牛肉面', description: '红烧牛肉面', price: 32, category: 'meal', available: true, restaurant: '面馆', location: '2号馆1楼' },
  { id: 'f4', name: '咖啡', description: '现磨美式咖啡', price: 25, category: 'beverage', available: true, restaurant: '咖啡厅', location: '主入口大厅' },
  { id: 'f5', name: '三明治', description: '火腿芝士三明治', price: 22, category: 'snack', available: true, restaurant: '咖啡厅', location: '主入口大厅' },
  { id: 'f6', name: '水果拼盘', description: '新鲜时令水果', price: 35, category: 'dessert', available: true, restaurant: '甜品站', location: '3号馆1楼' },
  { id: 'f7', name: '奶茶', description: '珍珠奶茶', price: 18, category: 'beverage', available: true, restaurant: '甜品站', location: '3号馆1楼' },
  { id: 'f8', name: '汉堡套餐', description: '牛肉汉堡+薯条+可乐', price: 42, category: 'meal', available: true, restaurant: '快餐店', location: '2号馆2楼' },
];

export const mockOrders: Order[] = [];

export const mockHeatMapData: HeatMapData[] = [
  { boothId: 'b1', visitorCount: 45, queueLength: 3, timestamp: new Date().toISOString() },
  { boothId: 'b2', visitorCount: 28, queueLength: 0, timestamp: new Date().toISOString() },
  { boothId: 'b3', visitorCount: 62, queueLength: 5, timestamp: new Date().toISOString() },
  { boothId: 'b4', visitorCount: 18, queueLength: 0, timestamp: new Date().toISOString() },
  { boothId: 'b5', visitorCount: 52, queueLength: 2, timestamp: new Date().toISOString() },
  { boothId: 'b7', visitorCount: 35, queueLength: 1, timestamp: new Date().toISOString() },
  { boothId: 'b8', visitorCount: 48, queueLength: 4, timestamp: new Date().toISOString() },
  { boothId: 'b10', visitorCount: 40, queueLength: 2, timestamp: new Date().toISOString() },
  { boothId: 'b11', visitorCount: 55, queueLength: 3, timestamp: new Date().toISOString() },
];

export const mockDailyStats: DailyStats[] = [
  { date: '2024-12-15', totalVisitors: 12500, totalExhibitors: 320, totalRevenue: 2850000, foodSales: 185000, conferenceAttendance: 2800 },
  { date: '2024-12-16', totalVisitors: 15200, totalExhibitors: 328, totalRevenue: 3200000, foodSales: 210000, conferenceAttendance: 3200 },
  { date: '2024-12-17', totalVisitors: 18500, totalExhibitors: 335, totalRevenue: 3680000, foodSales: 258000, conferenceAttendance: 3800 },
  { date: '2024-12-18', totalVisitors: 22000, totalExhibitors: 342, totalRevenue: 4150000, foodSales: 295000, conferenceAttendance: 4500 },
  { date: '2024-12-19', totalVisitors: 19800, totalExhibitors: 345, totalRevenue: 3890000, foodSales: 272000, conferenceAttendance: 4200 },
  { date: '2024-12-20', totalVisitors: 17500, totalExhibitors: 348, totalRevenue: 3520000, foodSales: 248000, conferenceAttendance: 3900 },
  { date: '2024-12-21', totalVisitors: 14200, totalExhibitors: 350, totalRevenue: 2980000, foodSales: 205000, conferenceAttendance: 3100 },
];

export const mockContracts: Contract[] = [
  {
    id: 'ct1',
    exhibitorId: 'e1',
    boothId: 'b3',
    amount: 52000,
    startDate: '2024-12-20',
    endDate: '2024-12-23',
    status: 'signed',
    content: '展位租赁合同',
    signedAt: '2024-11-15'
  },
  {
    id: 'ct2',
    exhibitorId: 'e2',
    boothId: 'b5',
    amount: 32000,
    startDate: '2024-12-20',
    endDate: '2024-12-23',
    status: 'signed',
    content: '展位租赁合同',
    signedAt: '2024-11-10'
  }
];

export const mockIndustryTrends: IndustryTrend[] = [
  { industry: 'electronics', growthRate: 15.2, predictedPopularity: 92, suggestedPrice: 38000 },
  { industry: 'medical', growthRate: 18.5, predictedPopularity: 88, suggestedPrice: 35000 },
  { industry: 'energy', growthRate: 22.3, predictedPopularity: 95, suggestedPrice: 36000 },
  { industry: 'automotive', growthRate: 8.7, predictedPopularity: 75, suggestedPrice: 32000 },
  { industry: 'machinery', growthRate: 6.2, predictedPopularity: 68, suggestedPrice: 30000 },
  { industry: 'food', growthRate: 10.5, predictedPopularity: 72, suggestedPrice: 28000 },
  { industry: 'textile', growthRate: 3.8, predictedPopularity: 55, suggestedPrice: 22000 },
  { industry: 'building', growthRate: -2.1, predictedPopularity: 45, suggestedPrice: 20000 },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u1', title: '展位预订成功', content: '您已成功预订1号馆A103展位', type: 'success', read: false, createdAt: '2024-11-15 10:30' },
  { id: 'n2', userId: 'u1', title: '商务洽谈邀请', content: '有3位潜在买家希望与您预约洽谈', type: 'info', read: false, createdAt: '2024-11-18 14:20' },
  { id: 'n3', userId: 'u2', title: '会议报名成功', content: '您已成功报名"智能制造高峰论坛"', type: 'success', read: true, createdAt: '2024-11-20 09:15' },
];

export function getIndustryName(industry: string): string {
  return industryNames[industry] || industry;
}

export function getMemberLevelName(level: string): string {
  const names: Record<string, string> = { silver: '银卡', gold: '金卡', diamond: '钻石卡' };
  return names[level] || level;
}

export function getMemberLevelColor(level: string): string {
  const colors: Record<string, string> = { silver: 'bg-gray-400', gold: 'bg-yellow-500', diamond: 'bg-purple-600' };
  return colors[level] || 'bg-gray-400';
}
