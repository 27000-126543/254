import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  BarChart3, Building2, Users, Calendar,
  MapPin, UtensilsCrossed, Crown, Bell,
  ChevronRight, TrendingUp, Clock
} from 'lucide-react';
import { api } from '../utils/api';

const Dashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [notifData, confData, overviewData] = await Promise.all([
        api.notifications.getAll(true).catch(() => []),
        api.conferences.getAll().catch(() => []),
        currentUser?.role === 'admin' ? api.admin.getOverview().catch(() => null) : null
      ]);
      setNotifications(Array.isArray(notifData) ? notifData : []);
      setConferences(Array.isArray(confData) ? confData : []);
      setOverview(overviewData);
    } catch (err) {
      console.error('加载Dashboard数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isExhibitor = currentUser?.role === 'exhibitor';
  const isVisitor = currentUser?.role === 'visitor';

  let welcomeText = '祝您参观愉快，发现更多商机';
  if (isAdmin) {
    welcomeText = '今天是管理日，查看展会运营一切正常';
  } else if (isExhibitor) {
    welcomeText = '祝您参展顺利，收获满满';
  }

  let bannerGradient = 'bg-gradient-to-r from-purple-600 to-pink-600';
  if (isAdmin) {
    bannerGradient = 'bg-gradient-to-r from-gray-800 to-gray-900';
  } else if (isExhibitor) {
    bannerGradient = 'bg-gradient-to-r from-blue-600 to-indigo-700';
  }

  const mockDailyStats = [
    { date: '12-15', totalVisitors: 18000 },
    { date: '12-16', totalVisitors: 21000 },
    { date: '12-17', totalVisitors: 23500 },
    { date: '12-18', totalVisitors: 25000 },
    { date: '12-19', totalVisitors: 22000 },
    { date: '12-20', totalVisitors: 24000 },
    { date: '12-21', totalVisitors: 20000 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className={`rounded-2xl p-8 text-white relative overflow-hidden ${bannerGradient}`}>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">
              欢迎回来，{currentUser?.username}
            </h2>
            <p className="text-white/70">
              {welcomeText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isExhibitor && (
            <>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-1">展位管理</h4>
                <p className="text-sm text-gray-500">选择和管理您的展位</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-1">展品管理</h4>
                <p className="text-sm text-gray-500">发布和管理展品信息</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-1">商务洽谈</h4>
                <p className="text-sm text-gray-500">智能匹配潜在买家</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold mb-1">会员中心</h4>
                <p className="text-sm text-gray-500">查看会员权益和等级</p>
              </div>
            </>
          )}

          {isVisitor && (
            <>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-1">展商推荐</h4>
                <p className="text-sm text-gray-500">智能推荐感兴趣的展商</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-semibold mb-1">热力地图</h4>
                <p className="text-sm text-gray-500">实时查看各展台热度</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-1">会议论坛</h4>
                <p className="text-sm text-gray-500">报名参加同期论坛</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <UtensilsCrossed className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-1">餐饮服务</h4>
                <p className="text-sm text-gray-500">展馆内扫码点餐</p>
              </div>
            </>
          )}

          {isAdmin && (
            <>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-1">管理看板</h4>
                <p className="text-sm text-gray-500">实时运营数据总览</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-1">数据分析</h4>
                <p className="text-sm text-gray-500">趋势预测与策略建议</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-1">会议管理</h4>
                <p className="text-sm text-gray-500">管理会议论坛活动</p>
              </div>
              <div className="card hover:shadow-md transition cursor-pointer">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold mb-1">报表导出</h4>
                <p className="text-sm text-gray-500">导出月度运营报告</p>
              </div>
            </>
          )}
        </div>

        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                待办提醒
              </h3>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">暂无新消息</p>
                ) : (
                  notifications.slice(0, 3).map((notif: any) => (
                    <div key={notif.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notif.type === 'success' ? 'bg-green-500' :
                        notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-gray-500">{notif.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card md:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
                近期活动
              </h3>
              <div className="space-y-3">
                {conferences.slice(0, 3).map((conf: any) => (
                  <div key={conf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{conf.title}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {conf.startTime}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
                {conferences.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">暂无活动安排</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              展位销售进度
            </h3>
            <div className="space-y-4">
              {['1号馆', '2号馆', '3号馆', '4号馆'].map((hall, idx) => {
                const percent = 60 + idx * 10;
                return (
                  <div key={hall}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{hall}</span>
                      <span className="text-sm text-gray-500">{Math.round(percent * 0.48)}/48</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              近7日流量趋势
            </h3>
            <div className="space-y-3">
              {mockDailyStats.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-16">{day.date}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(day.totalVisitors / 25000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{(day.totalVisitors / 1000)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
