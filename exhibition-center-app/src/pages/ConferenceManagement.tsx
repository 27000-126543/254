import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  Calendar, Clock, MapPin, Users, Video,
  CheckCircle, Award, PlayCircle, User,
  ChevronRight, Filter
} from 'lucide-react';
import { getIndustryName, getMemberLevelName, getMemberLevelColor } from '../data/mockData';
import type { Conference } from '../types';

const ConferenceManagement: React.FC = () => {
  const { conferences, currentUser, registerConference, addNotification, users } = useApp();
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSeatMap, setShowSeatMap] = useState(false);

  const filteredConferences = conferences.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const handleRegister = (conference: Conference) => {
    if (!currentUser) return;
    if (conference.registeredCount >= conference.totalSeats) {
      alert('该会议名额已满');
      return;
    }
    
    const success = registerConference(conference.id, currentUser.id);
    if (success) {
      addNotification({
        userId: currentUser.id,
        title: '会议报名成功',
        content: `您已成功报名"${conference.title}"，请准时参加`,
        type: 'success'
      });
      alert('报名成功！座位已自动分配');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'ended': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'ended': return '已结束';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* 筛选 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            {['all', 'upcoming', 'ongoing', 'ended'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? '全部' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* 会议列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredConferences.map(conference => (
            <div key={conference.id} className="card hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`badge ${getStatusColor(conference.status)}`}>
                    {getStatusText(conference.status)}
                  </span>
                  <h3 className="text-lg font-semibold mt-2">{conference.title}</h3>
                </div>
                <span className="text-xs text-gray-400">{getIndustryName(conference.industry)}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{conference.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {conference.startTime}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {conference.endTime.split(' ')[1]}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {conference.venue}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {conference.registeredCount}/{conference.totalSeats}人
                </div>
              </div>

              {/* 讲者信息 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{conference.speaker}</p>
                  <p className="text-xs text-gray-500">特邀讲者</p>
                </div>
              </div>

              {/* 报名进度 */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">报名进度</span>
                  <span className="font-medium">
                    {Math.round((conference.registeredCount / conference.totalSeats) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all"
                    style={{ width: `${(conference.registeredCount / conference.totalSeats) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {conference.status === 'upcoming' && (
                  <>
                    <button
                      onClick={() => { setShowSeatMap(true); setSelectedConference(conference); }}
                      className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      座位分布
                    </button>
                    <button
                      onClick={() => handleRegister(conference)}
                      disabled={conference.registeredCount >= conference.totalSeats}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      立即报名
                    </button>
                  </>
                )}
                {conference.status === 'ongoing' && (
                  <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    进入直播
                  </button>
                )}
                {conference.status === 'ended' && conference.replayUrl && (
                  <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    查看回放
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 座位分布弹窗 */}
        {showSeatMap && selectedConference && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  座位分布与分配规则
                </h3>
                <button
                  onClick={() => setShowSeatMap(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* 分配规则说明 */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">座位分配规则</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 系统按报名顺序和会员等级自动分配座位</li>
                    <li>• 钻石卡会员优先选择前排VIP区域</li>
                    <li>• 金卡会员优先选择中间区域</li>
                    <li>• 银卡会员按报名顺序分配剩余座位</li>
                  </ul>
                </div>

                {/* 模拟座位图 */}
                <div>
                  <h4 className="font-medium mb-3">座位示意图</h4>
                  <div className="bg-gray-100 rounded-xl p-6">
                    {/* 讲台 */}
                    <div className="bg-primary-600 text-white text-center py-2 rounded-lg mb-6 text-sm">
                      讲台 / 舞台
                    </div>
                    
                    {/* VIP区 */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded" />
                        VIP区（钻石卡会员专属）
                      </p>
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 20 }).map((_, idx) => (
                          <div
                            key={`vip-${idx}`}
                            className={`aspect-square rounded ${
                              idx < 12 ? 'bg-purple-500' : 'bg-gray-300'
                            }`}
                            title={idx < 12 ? '已占用' : '空闲'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* 金卡区 */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded" />
                        金卡区
                      </p>
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 30 }).map((_, idx) => (
                          <div
                            key={`gold-${idx}`}
                            className={`aspect-square rounded ${
                              idx < 20 ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                            title={idx < 20 ? '已占用' : '空闲'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* 普通区 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-gray-500 rounded" />
                        普通区（银卡）
                      </p>
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 50 }).map((_, idx) => (
                          <div
                            key={`normal-${idx}`}
                            className={`aspect-square rounded ${
                              idx < 35 ? 'bg-gray-500' : 'bg-gray-300'
                            }`}
                            title={idx < 35 ? '已占用' : '空闲'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 已报名观众列表 */}
                <div>
                  <h4 className="font-medium mb-3">已报名观众（按会员等级排序）</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {users.slice(0, 5).map((user, idx) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-sm">{user.username}</span>
                        </div>
                        <span className={`badge ${getMemberLevelColor(user.memberLevel)} text-white`}>
                          {getMemberLevelName(user.memberLevel)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowSeatMap(false)}
                  className="btn btn-primary w-full"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConferenceManagement;
