import React from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  BarChart3, TrendingUp, Lightbulb, Target,
  DollarSign, ArrowUpRight, ArrowDownRight,
  Sparkles, PieChart, Calendar
} from 'lucide-react';
import { mockIndustryTrends, mockDailyStats, getIndustryName } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const Analytics: React.FC = () => {
  const { exhibitors, booths } = useApp();

  const trendData = mockIndustryTrends.map(t => ({
    name: getIndustryName(t.industry),
    增长率: t.growthRate,
    预测热度: t.predictedPopularity,
  }));

  const priceData = mockIndustryTrends.map(t => ({
    name: getIndustryName(t.industry),
    建议定价: t.suggestedPrice / 1000,
    当前均价: Math.round(t.suggestedPrice * 0.9) / 1000,
  }));

  const strategyRecommendations = [
    {
      title: '新能源展区',
      priority: '高',
      suggestion: '建议扩大展区面积30%，增加20个展位，预计可提升收入25%',
      reason: '行业增长率22.3%，预测热度95，市场需求旺盛'
    },
    {
      title: '医疗健康展区',
      priority: '高',
      suggestion: '建议引入3-5家国际知名企业，提升展区国际化水平',
      reason: '行业增长率18.5%，专业观众关注度持续提升'
    },
    {
      title: '电子科技展区',
      priority: '中',
      suggestion: '建议展位价格上调5-8%，设置特装展示区',
      reason: '市场需求稳定，展位供不应求，有价格上涨空间'
    },
    {
      title: '纺织服装展区',
      priority: '低',
      suggestion: '建议缩减面积20%，转型为时尚创意设计展区',
      reason: '行业增长放缓，传统业态吸引力下降，需转型升级'
    },
  ];

  const radarData = mockIndustryTrends.slice(0, 6).map(t => ({
    subject: getIndustryName(t.industry),
    A: t.predictedPopularity,
    B: Math.round(t.growthRate * 5),
    fullMark: 100,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* 预测概览 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold">下届展会预测分析</h2>
          </div>
          <p className="text-indigo-100 mb-6">
            基于历史数据和行业趋势，为您智能预测热门品类并提供招展策略建议
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-sm">预测热门品类</p>
              <p className="text-2xl font-bold mt-1">新能源</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +22.3% 增长
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-sm">预计展商增长</p>
              <p className="text-2xl font-bold mt-1">+15.8%</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> 约55家新增
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-sm">预计观众增长</p>
              <p className="text-2xl font-bold mt-1">+20.5%</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> 约2.5万人次
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-indigo-200 text-sm">预期收入增长</p>
              <p className="text-2xl font-bold mt-1">+28.2%</p>
              <p className="text-xs text-green-300 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> 约800万元
              </p>
            </div>
          </div>
        </div>

        {/* 行业趋势分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              各行业增长率与预测热度
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="增长率" radius={[4, 4, 0, 0]} fill="#3b82f6" />
                <Bar dataKey="预测热度" radius={[4, 4, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              展位定价建议（千元/标准展位）
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="当前均价" radius={[4, 4, 0, 0]} fill="#9ca3af" />
                <Bar dataKey="建议定价" radius={[4, 4, 0, 0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 雷达图 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-600" />
            各行业综合评估雷达图
          </h3>
          <div className="max-w-lg mx-auto">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="市场热度" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="增长潜力" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 策略建议 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            智能招展策略建议
          </h3>
          <div className="space-y-4">
            {strategyRecommendations.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.priority === '高' ? 'bg-red-100 text-red-600' :
                      item.priority === '中' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        item.priority === '高' ? 'bg-red-100 text-red-700' :
                        item.priority === '中' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        优先级：{item.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{item.suggestion}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
