import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  MapPin, Users, Clock, RefreshCw, Info,
  Flame, ThermometerSun, Wind
} from 'lucide-react';
import { api } from '../utils/api';

interface HeatmapRecord {
  id: string;
  boothId: string;
  boothNumber: string;
  hall: string;
  zone: string;
  area: number;
  visitorCount: number;
  queueLength: number;
  timestamp: string;
}

const HeatMap: React.FC = () => {
  const [selectedHall, setSelectedHall] = useState('1号馆');
  const [heatmapData, setHeatmapData] = useState<HeatmapRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const halls = ['1号馆', '2号馆', '3号馆', '4号馆'];

  useEffect(() => {
    loadHeatmapData();
  }, [selectedHall]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        api.heatmap.get(selectedHall),
        api.heatmap.getStats()
      ]);
      setHeatmapData(data as HeatmapRecord[]);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('加载热力图数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadHeatmapData();
  };

  const getHeatColor = (count: number) => {
    if (count >= 50) return 'bg-red-500';
    if (count >= 35) return 'bg-orange-500';
    if (count >= 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHeatIntensity = (count: number) => {
    if (count >= 50) return '拥挤';
    if (count >= 35) return '较热';
    if (count >= 20) return '适中';
    return '舒适';
  };

  const totalVisitors = heatmapData.reduce((sum, h) => sum + h.visitorCount, 0);
  const hotBooths = heatmapData.filter(h => h.visitorCount >= 35).length;
  const avgQueue = heatmapData.length > 0 
    ? Math.round(heatmapData.reduce((sum, h) => sum + h.queueLength, 0) / heatmapData.length)
    : 0;

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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {halls.map(hall => (
              <button
                key={hall}
                onClick={() => setSelectedHall(hall)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedHall === hall
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {hall}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
            刷新数据
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">当前观众</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalVisitors || totalVisitors}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">热门展位</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.hotBooths || hotBooths}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">平均排队</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.avgQueue || avgQueue}人
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">更新时间</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-primary-600" />
              实时热力分布
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-500" />
                <span className="text-gray-600">舒适</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-gray-600">适中</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-gray-600">较热</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-red-500" />
                <span className="text-gray-600">拥挤</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm rounded-full">
                入口
              </div>
              
              <div className="grid grid-cols-6 gap-4 mt-4">
                {heatmapData.map((record, idx) => (
                  <div
                    key={record.id}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${getHeatColor(record.visitorCount)} bg-opacity-80`}
                  >
                    <div className="text-white">
                      <p className="font-bold text-sm">{record.boothNumber}</p>
                      <p className="text-xs opacity-80">{record.area}㎡</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/30">
                      <div className="flex items-center gap-1 text-white text-xs">
                        <Users className="w-3 h-3" />
                        {record.visitorCount}
                      </div>
                      {record.queueLength > 0 && (
                        <div className="flex items-center gap-1 text-white text-xs mt-1">
                          <Clock className="w-3 h-3" />
                          排队{record.queueLength}人
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                      <p>{record.boothNumber} - {getHeatIntensity(record.visitorCount)}</p>
                      <p>当前人数: {record.visitorCount}人</p>
                      {record.queueLength > 0 && <p>排队: {record.queueLength}人</p>}
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 12 - heatmapData.length) }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="p-4 rounded-xl bg-gray-200 opacity-30" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary-600" />
            展位实时详情
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">展位号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">位置</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当前人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">排队人数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">热度状态</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map(record => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{record.boothNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{record.hall} {record.zone}</td>
                    <td className="py-3 px-4">{record.visitorCount}人</td>
                    <td className="py-3 px-4">
                      {record.queueLength > 0 ? `${record.queueLength}人` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        record.visitorCount >= 50 ? 'bg-red-100 text-red-700' :
                        record.visitorCount >= 35 ? 'bg-orange-100 text-orange-700' :
                        record.visitorCount >= 20 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${getHeatColor(record.visitorCount)}`} />
                        {getHeatIntensity(record.visitorCount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HeatMap;
