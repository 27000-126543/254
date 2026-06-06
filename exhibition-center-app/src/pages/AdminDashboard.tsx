import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  BarChart3, Users, Building2, MapPin, Calendar,
  TrendingUp, DollarSign, Clock,
  Filter
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { api } from '../utils/api';

const AdminDashboard: React.FC = () => {
  const [selectedHall, setSelectedHall] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2024-12-20');
  const [overview, setOverview] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const halls = ['all', '1号馆', '2号馆', '3号馆', '4号馆'];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [overviewData, statsData] = await Promise.all([
        api.admin.getOverview().catch(() => null),
        api.admin.getDailyStats().catch(() => [])
      ]);
      setOverview(overviewData);
      setDailyStats(Array.isArray(statsData) ? statsData : []);
    } catch (err) {
      console.error('加载管理员数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const mockDailyStats = dailyStats.length > 0 ? dailyStats : [
    { date: '12-15', totalVisitors: 18000, totalRevenue: 520000, foodSales: 85000, conferenceAttendance: 3200 },
    { date: '12-16', totalVisitors: 21000, totalRevenue: 580000, foodSales: 92000, conferenceAttendance: 3800 },
    { date: '12-17', totalVisitors: 23500, totalRevenue: 650000, foodSales: 105000, conferenceAttendance: 4200 },
    { date: '12-18', totalVisitors: 25000, totalRevenue: 720000, foodSales: 118000, conferenceAttendance: 4500 },
    { date: '12-19', totalVisitors: 22000, totalRevenue: 680000, foodSales: 98000, conferenceAttendance: 3900 },
    { date: '12-20', totalVisitors: 24000, totalRevenue: 700000, foodSales: 108000, conferenceAttendance: 4100 },
    { date: '12-21', totalVisitors: 20000, totalRevenue: 620000, foodSales: 88000, conferenceAttendance: 3500 },
  ];

  const totalExhibitors = overview?.totalExhibitors || 156;
  const totalVisitors = overview?.totalVisitors || 2850;
  const totalRevenue = overview?.totalRevenue || mockDailyStats.reduce((sum: number, d: any) => sum + (d.totalRevenue || 0), 0);
  const avgAttendance = overview?.avgAttendance || Math.round(mockDailyStats.reduce((sum: number, d: any) => sum + (d.totalVisitors || 0), 0) / mockDailyStats.length);

  const boothStats = overview?.boothStats || {
    total: 192,
    sold: 125,
    reserved: 28,
    available: 39,
  };

  const conferenceStats = overview?.conferenceStats || {
    total: 24,
    upcoming: 12,
    ongoing: 8,
    ended: 4,
  };

  const revenueData = mockDailyStats.map((d: any) => ({
    date: d.date,
    展位收入: (d.totalRevenue || 0) - (d.foodSales || 0),
    餐饮收入: d.foodSales || 0,
  }));

  const visitorData = mockDailyStats.map((d: any) => ({
    date: d.date,
    观众流量: d.totalVisitors || 0,
    会议参与: d.conferenceAttendance || 0,
  }));

  const hallHeatData = [
    { name: '1号馆', value: 4500, color: '#3b82f6' },
    { name: '2号馆', value: 3800, color: '#10b981' },
    { name: '3号馆', value: 4200, color: '#f59e0b' },
    { name: '4号馆', value: 2900, color: '#8b5cf6' },
  ];

  const industryDistribution = [
    { name: '电子科技', value: 85, color: '#3b82f6' },
    { name: '医疗器械', value: 62, color: '#10b981' },
    { name: '新能源', value: 58, color: '#f59e0b' },
    { name: '汽车制造', value: 45, color: '#ef4444' },
    { name: '机械设备', value: 38, color: '#8b5cf6' },
    { name: '其他', value: 62, color: '#6b7280' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="input w-auto"
            >
              {halls.map(hall => (
                <option key={hall} value={hall}>
                  {hall === 'all' ? '全部展馆' : hall}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">参展商数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalExhibitors}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">累计观众</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalVisitors}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +18.2%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总收入</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">¥{(totalRevenue / 10000).toFixed(0)}万</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +25.8%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">日均流量</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{avgAttendance}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +8.3%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              展位销售情况
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold">{boothStats.total}</p>
                <p className="text-xs text-gray-500">总展位</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{boothStats.sold}</p>
                <p className="text-xs text-gray-500">已售出</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{boothStats.reserved}</p>
                <p className="text-xs text-gray-500">已预留</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{boothStats.available}</p>
                <p className="text-xs text-gray-500">可售</p>
              </div>
            </div>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full" style={{ width: `${(boothStats.sold / boothStats.total) * 100}%` }} />
              <div className="bg-yellow-500 h-full" style={{ width: `${(boothStats.reserved / boothStats.total) * 100}%` }} />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              会议论坛状态
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold">{conferenceStats.total}</p>
                <p className="text-xs text-gray-500">总会议</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{conferenceStats.upcoming}</p>
                <p className="text-xs text-gray-500">即将开始</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{conferenceStats.ongoing}</p>
                <p className="text-xs text-gray-500">进行中</p>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-xl">
                <p className="text-2xl font-bold text-gray-600">{conferenceStats.ended}</p>
                <p className="text-xs text-gray-500">已结束</p>
              </div>
            </div>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div className="bg-blue-500 h-full" style={{ width: `${(conferenceStats.upcoming / conferenceStats.total) * 100}%` }} />
              <div className="bg-green-500 h-full" style={{ width: `${(conferenceStats.ongoing / conferenceStats.total) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">收入趋势</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="展位收入" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="餐饮收入" stackId="1" stroke="#10b981" fill="#6ee7b7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">观众流量趋势</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="观众流量" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="会议参与" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">各展馆热度分布</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hallHeatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {hallHeatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">行业展商分布</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={industryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {industryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            各展区实时数据
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">展区</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">展位总数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">已售出</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当前观众</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">销售率</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">热度</th>
                </tr>
              </thead>
              <tbody>
                {['A区', 'B区', 'C区', 'D区', 'E区', 'F区'].map((zone, idx) => {
                  const totalBooths = 32;
                  const sold = Math.round(20 + idx * 2);
                  const heat = Math.floor(30 + Math.random() * 40);
                  return (
                    <tr key={zone} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{zone}</td>
                      <td className="py-3 px-4">{totalBooths}</td>
                      <td className="py-3 px-4">{sold}</td>
                      <td className="py-3 px-4">{Math.floor(100 + Math.random() * 200)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(sold / totalBooths) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round((sold / totalBooths) * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          heat > 50 ? 'bg-red-100 text-red-700' :
                          heat > 35 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {heat > 50 ? '🔥 热门' : heat > 35 ? '⭐ 良好' : '✨ 正常'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
