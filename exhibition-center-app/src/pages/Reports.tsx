import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  FileText, Download, Calendar, Filter,
  BarChart3, Users, Building2, DollarSign,
  Star, CheckCircle, TrendingUp, Eye
} from 'lucide-react';
import { mockDailyStats } from '../data/mockData';

const Reports: React.FC = () => {
  const { users, exhibitors, booths, conferences, orders, contracts } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2024-12');
  const [reportType, setReportType] = useState('monthly');

  const months = ['2024-09', '2024-10', '2024-11', '2024-12'];

  const reportData = {
    totalRevenue: mockDailyStats.reduce((sum, d) => sum + d.totalRevenue, 0),
    boothRevenue: contracts.reduce((sum, c) => sum + c.amount, 0),
    foodRevenue: mockDailyStats.reduce((sum, d) => sum + d.foodSales, 0),
    totalExhibitors: exhibitors.length,
    totalVisitors: users.filter(u => u.role === 'visitor').length,
    avgVisitorPerDay: Math.round(mockDailyStats.reduce((sum, d) => sum + d.totalVisitors, 0) / mockDailyStats.length),
    boothSalesRate: Math.round((booths.filter(b => b.status !== 'available').length / booths.length) * 100),
    avgConferenceAttendance: Math.round(conferences.reduce((sum, c) => sum + c.registeredCount, 0) / conferences.length),
    exhibitorSatisfaction: 4.6,
    visitorConversion: 28.5,
    conferenceParticipation: 72.3,
  };

  const hallRevenue = [
    { hall: '1号馆', revenue: 8500000, exhibitors: 125, satisfaction: 4.7 },
    { hall: '2号馆', revenue: 6800000, exhibitors: 98, satisfaction: 4.5 },
    { hall: '3号馆', revenue: 7200000, exhibitors: 105, satisfaction: 4.6 },
    { hall: '4号馆', revenue: 5200000, exhibitors: 72, satisfaction: 4.4 },
  ];

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = {
      reportType,
      month: selectedMonth,
      generatedAt: new Date().toLocaleString('zh-CN'),
      summary: reportData,
      hallDetails: hallRevenue,
    };
    
    alert(`${format === 'excel' ? 'Excel' : 'PDF'}报表已生成并开始下载！\n\n报表数据：\n总收入：¥${(reportData.totalRevenue / 10000).toFixed(0)}万\n参展商数：${reportData.totalExhibitors}\n观众人数：${reportData.totalVisitors}\n展位销售率：${reportData.boothSalesRate}%`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* 筛选和导出 */}
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="input w-auto"
                >
                  <option value="monthly">月度运营报告</option>
                  <option value="quarterly">季度运营报告</option>
                  <option value="annual">年度运营报告</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input w-auto"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('excel')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出PDF
              </button>
            </div>
          </div>
        </div>

        {/* 报告预览 */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              2024年12月运营报告
            </h3>
            <button className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              <Eye className="w-4 h-4" />
              预览完整报告
            </button>
          </div>

          {/* 核心指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">¥{(reportData.totalRevenue / 10000).toFixed(0)}万</p>
              <p className="text-sm text-gray-500">总收入</p>
              <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" /> +28.2% 同比
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{reportData.totalExhibitors}</p>
              <p className="text-sm text-gray-500">参展商数</p>
              <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" /> +15.8% 同比
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{reportData.totalVisitors}</p>
              <p className="text-sm text-gray-500">观众人数</p>
              <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" /> +20.5% 同比
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{reportData.exhibitorSatisfaction}</p>
              <p className="text-sm text-gray-500">展商满意度</p>
              <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0.3 同比
              </p>
            </div>
          </div>

          {/* 各展馆收入明细 */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              各展馆收入明细
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">展馆</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">展位收入</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">参展商数</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">销售率</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">展商满意度</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">收入占比</th>
                  </tr>
                </thead>
                <tbody>
                  {hallRevenue.map((hall, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{hall.hall}</td>
                      <td className="py-3 px-4 text-right font-semibold">¥{(hall.revenue / 10000).toFixed(0)}万</td>
                      <td className="py-3 px-4 text-right">{hall.exhibitors}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-600 font-medium">{Math.round(hall.exhibitors / 1.3)}%</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          {hall.satisfaction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {Math.round(hall.revenue / hallRevenue.reduce((s, h) => s + h.revenue, 0) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 关键指标分析 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h5 className="font-semibold">展位销售率</h5>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.boothSalesRate}%</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${reportData.boothSalesRate}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">较上月提升5.2个百分点</p>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold">观众转化率</h5>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.visitorConversion}%</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${reportData.visitorConversion}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">专业观众占比持续提升</p>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h5 className="font-semibold">会议参与度</h5>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{reportData.conferenceParticipation}%</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${reportData.conferenceParticipation}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">论坛平均上座率超七成</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
