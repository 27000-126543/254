import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  Building2, MapPin, Star, Users, Calendar,
  Heart, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react';
import { getIndustryName } from '../data/mockData';

const ExhibitorRecommendations: React.FC = () => {
  const { currentUser, exhibitors, visitors, conferences } = useApp();
  
  const currentVisitor = visitors.find(v => v.userId === currentUser?.id);
  
  const recommendedExhibitors = useMemo(() => {
    if (!currentVisitor) return exhibitors;
    
    const matched = exhibitors.map(exhibitor => {
      const matchScore = currentVisitor.interestedIndustries.includes(exhibitor.industry) 
        ? 80 + Math.random() * 20 
        : 40 + Math.random() * 30;
      return { ...exhibitor, matchScore: Math.round(matchScore) };
    });
    
    return matched.sort((a, b) => b.matchScore - a.matchScore);
  }, [exhibitors, currentVisitor]);

  const recommendedConferences = useMemo(() => {
    if (!currentVisitor) return conferences.slice(0, 3);
    return conferences
      .filter(c => currentVisitor.interestedIndustries.includes(c.industry))
      .slice(0, 3);
  }, [conferences, currentVisitor]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* 欢迎横幅 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">欢迎回来，{currentVisitor?.name || '访客'}</h2>
          </div>
          <p className="text-purple-100 mb-4">
            根据您感兴趣的行业，我们为您精选了以下展商和活动
          </p>
          <div className="flex flex-wrap gap-2">
            {currentVisitor?.interestedIndustries.map(ind => (
              <span key={ind} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                {getIndustryName(ind)}
              </span>
            ))}
          </div>
        </div>

        {/* 推荐展商 */}
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
            {recommendedExhibitors.map(exhibitor => (
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
                      <span className="text-sm font-medium">{(exhibitor as any).matchScore}%</span>
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
                  {exhibitor.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">展品预览</p>
                      <div className="flex flex-wrap gap-1">
                        {exhibitor.products.slice(0, 3).map(p => (
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

        {/* 推荐会议和活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              推荐同期论坛
            </h3>
            <div className="space-y-3">
              {recommendedConferences.map(conf => (
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
              {['electronics', 'medical', 'energy', 'automotive'].map((ind, idx) => (
                <div key={ind} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium">{getIndustryName(ind)}</p>
                      <p className="text-xs text-gray-500">32家展商参展</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+{(Math.random() * 20 + 5).toFixed(1)}%</span>
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
