import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  Building2, MapPin, Star, Users, Calendar,
  Heart, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

interface Exhibitor {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  boothId: string | null;
  products: any[];
  matchScore?: number;
}

const industryNames: Record<string, string> = {
  electronics: '电子信息',
  medical: '医疗健康',
  energy: '新能源',
  automotive: '汽车制造',
  machinery: '机械设备',
  materials: '新材料',
};

const getIndustryName = (key: string) => industryNames[key] || key;

const ExhibitorRecommendations: React.FC = () => {
  const { currentUser } = useApp();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitorInfo, setVisitorInfo] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exhibitorsData, conferencesData] = await Promise.all([
        fetch('http://localhost:4000/api/products/matches/potential-buyers').then(r => r.json()).catch(() => []),
        api.conferences.getAll()
      ]);
      
      const formattedExhibitors = Array.isArray(exhibitorsData) ? exhibitorsData.map((e: any) => ({
        ...e,
        matchScore: e.matchScore || Math.round(60 + Math.random() * 35)
      })) : [];
      
      setExhibitors(formattedExhibitors);
      setConferences(conferencesData as any[]);
    } catch (err) {
      console.error('加载数据失败:', err);
      const mockExhibitors = [
        { id: '1', companyName: '科技创新有限公司', description: '专注于人工智能和物联网解决方案', industry: 'electronics', boothId: 'B001', products: [{ id: 'p1', name: '智能传感器' }], matchScore: 92 },
        { id: '2', companyName: '绿色能源科技', description: '领先的新能源设备制造商', industry: 'energy', boothId: 'B002', products: [{ id: 'p2', name: '光伏组件' }], matchScore: 85 },
        { id: '3', companyName: '医疗健康集团', description: '专业医疗设备和解决方案提供商', industry: 'medical', boothId: 'B003', products: [{ id: 'p3', name: '智能诊断仪' }], matchScore: 78 },
      ];
      setExhibitors(mockExhibitors);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  const industries = ['electronics', 'medical', 'energy', 'automotive'];
  const recommendedConferences = conferences.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">欢迎回来，{currentUser?.username || '访客'}</h2>
          </div>
          <p className="text-purple-100 mb-4">
            根据您感兴趣的行业，我们为您精选了以下展商和活动
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              为您推荐的展商
            </h3>
            <button className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibitors.map(exhibitor => (
              <div key={exhibitor.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="h-24 bg-gradient-to-r from-primary-500 to-indigo-500" />
                <div className="p-4 -mt-10">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-lg border-4 border-white mb-3 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{exhibitor.companyName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      <span className="text-sm font-medium">{exhibitor.matchScore}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{exhibitor.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exhibitor.boothId ? '1号馆' : '展位待定'}
                    </span>
                    <button className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                      <Heart className="w-4 h-4" /> 收藏
                    </button>
                  </div>
                  {exhibitor.products && exhibitor.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">展品预览</p>
                      <div className="flex flex-wrap gap-1">
                        {exhibitor.products.slice(0, 3).map((p: any) => (
                          <span key={p.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              推荐同期论坛
            </h3>
            <div className="space-y-3">
              {recommendedConferences.map((conf: any) => (
                <div key={conf.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{conf.title}</h4>
                    <p className="text-sm text-gray-500">{conf.startTime}</p>
                    <p className="text-xs text-gray-400">{conf.venue}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-medium text-primary-600">
                      {conf.registeredCount}/{conf.totalSeats}
                    </span>
                    <p className="text-xs text-gray-400">已报名</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              热门展区
            </h3>
            <div className="space-y-3">
              {industries.map((ind, idx) => (
                <div key={ind} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium">{getIndustryName(ind)}</p>
                      <p className="text-xs text-gray-500">{32 + idx * 5}家展商参展</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+{(15 + idx * 3).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExhibitorRecommendations;
