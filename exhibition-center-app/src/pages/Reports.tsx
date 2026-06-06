import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  FileText, Download, TrendingUp, Users, DollarSign,
  Building2, Calendar, MapPin, Clock,
  Filter
} from 'lucide-react';
import { api } from '../utils/api';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2024-12');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, [reportType, selectedMonth]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getMonthlyReport(selectedMonth).catch(() => null);
      setReport(data);
    } catch (err) {
      console.error('加载报告失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    alert(`正在导出 ${format.toUpperCase()} 格式的报表...`);
  };

  const reportData = report || {
    month: selectedMonth,
    totalRevenue: 4280000,
    totalVisitors: 158000,
    totalExhibitors: 156,
    boothSoldRate: 68.5,
    totalMeetings: 420,
    avgBoothPrice: 13500,
    topIndustries: [
      { name: '新能源', booths: 45, revenue: 810000, growth: 22.3 },
      { name: '电子信息', booths: 42, revenue: 630000, growth: 15.2 },
      { name: '医疗健康', booths: 38, revenue: 684000, growth: 18.5 },
      { name: '汽车制造', booths: 32, revenue: 512000, growth: 12.8 },
      { name: '机械设备', booths: 28, revenue: 336000, growth: 8.5 },
    ],
    dailyMetrics: [
      { date: '12-15', visitors: 18000, revenue: 520000, meetings: 45 },
      { date: '12-16', visitors: 21000, revenue: 580000, meetings: 52 },
      { date: '12-17', visitors: 23500, revenue: 650000, meetings: 58 },
      { date: '12-18', visitors: 25000, revenue: 720000, meetings: 62 },
      { date: '12-19', visitors: 22000, revenue: 680000, meetings: 55 },
      { date: '12-20', visitors: 24000, revenue: 700000, meetings: 60 },
      { date: '12-21', visitors: 20000, revenue: 620000, meetings: 48 },
    ],
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input w-auto"
              >
                <option value="daily">日报表</option>
                <option value="weekly">周报表</option>
                <option value="monthly">月报表</option>
                <option value="quarterly">季度报表</option>
                <option value="annual">年度报表</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input w-auto"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出Excel
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">{selectedMonth} 月度运营报告</h2>
          </div>
          <p className="text-blue-100 mb-6">
            展会整体运营情况分析，包含收入、客流、招商等核心指标
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-blue-200 text-sm">总收入</p>
              <p className="text-2xl font-bold mt-1">¥{(reportData.totalRevenue / 10000).toFixed(0)}万</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +18.5% 同比
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-blue-200 text-sm">总观众</p>
              <p className="text-2xl font-bold mt-1">{reportData.totalVisitors.toLocaleString()}</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +12.3% 同比
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-blue-200 text-sm">参展商数</p>
              <p className="text-2xl font-bold mt-1">{reportData.totalExhibitors}</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +8.7% 同比
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-blue-200 text-sm">展位销售率</p>
              <p className="text-2xl font-bold mt-1">{reportData.boothSoldRate}%</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +5.2% 同比
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              各行业招商情况
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">行业</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">展位</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">收入</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">增长</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topIndustries.map((industry: any) => (
                    <tr key={industry.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{industry.name}</td>
                      <td className="py-3 px-4">{industry.booths}个</td>
                      <td className="py-3 px-4">¥{(industry.revenue / 10000).toFixed(0)}万</td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 text-sm">+{industry.growth}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              核心财务指标
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">展位收入</p>
                    <p className="text-sm text-gray-500">标准展位+特装展位</p>
                  </div>
                </div>
                <p className="text-xl font-bold">¥{(reportData.totalRevenue * 0.75 / 10000).toFixed(0)}万</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">餐饮收入</p>
                    <p className="text-sm text-gray-500">展馆内餐饮服务</p>
                  </div>
                </div>
                <p className="text-xl font-bold">¥{(reportData.totalRevenue * 0.15 / 10000).toFixed(0)}万</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">会议收入</p>
                    <p className="text-sm text-gray-500">论坛和活动门票</p>
                  </div>
                </div>
                <p className="text-xl font-bold">¥{(reportData.totalRevenue * 0.10 / 10000).toFixed(0)}万</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            每日指标统计
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">观众人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当日收入</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">商务洽谈</th>
                </tr>
              </thead>
              <tbody>
                {reportData.dailyMetrics.map((day: any) => (
                  <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{day.date}</td>
                    <td className="py-3 px-4">{day.visitors.toLocaleString()}</td>
                    <td className="py-3 px-4">¥{(day.revenue / 10000).toFixed(0)}万</td>
                    <td className="py-3 px-4">{day.meetings}场</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">报告摘要</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              本月展会整体运营情况良好，各项核心指标均实现同比增长。总收入达到
              <span className="font-semibold text-primary-600">¥{(reportData.totalRevenue / 10000).toFixed(0)}万元</span>，
              同比增长18.5%。其中展位收入占比75%，仍然是主要收入来源。
            </p>
            <p>
              观众方面，本月累计接待观众
              <span className="font-semibold text-primary-600">{reportData.totalVisitors.toLocaleString()}人次</span>，
              同比增长12.3%。新能源、电子信息、医疗健康三个行业表现尤为突出，
              展位数量和收入均实现两位数增长。
            </p>
            <p>
              展位销售率达到<span className="font-semibold text-primary-600">{reportData.boothSoldRate}%</span>，
              较上月提升5.2个百分点。建议下届展会可考虑增加新能源和医疗健康展区面积，
              以满足市场需求。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
