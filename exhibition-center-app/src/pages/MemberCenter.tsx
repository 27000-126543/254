import React from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  Crown, Gift, TrendingUp, Calendar, CreditCard,
  Star, CheckCircle, ArrowRight, Clock, Zap,
  Headphones, BadgeCheck, Sparkles
} from 'lucide-react';
import type { MemberLevel } from '../types';

const memberLevelNames: Record<string, string> = {
  silver: '银卡',
  gold: '金卡',
  diamond: '钻石卡'
};

const getMemberLevelName = (level: string) => memberLevelNames[level] || '银卡';

const getMemberLevelColor = (level: string) => {
  switch (level) {
    case 'diamond': return 'bg-purple-500';
    case 'gold': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const MemberCenter: React.FC = () => {
  const { currentUser, memberInfo, recharge } = useApp();

  const levelThresholds = {
    silver: { min: 0, max: 10000, label: '银卡' },
    gold: { min: 10000, max: 50000, label: '金卡' },
    diamond: { min: 50000, max: Infinity, label: '钻石卡' },
  };

  const currentLevel = memberInfo?.level || currentUser?.memberLevel || 'silver';
  const currentLevelData = levelThresholds[currentLevel as keyof typeof levelThresholds];
  const nextLevel = currentLevel === 'silver' ? 'gold' : 
                    currentLevel === 'gold' ? 'diamond' : null;
  const nextLevelData = nextLevel ? levelThresholds[nextLevel as keyof typeof levelThresholds] : null;
  
  const totalConsumption = currentUser?.totalConsumption || currentUser?.memberPoints || 0;
  const progress = nextLevelData ? 
    Math.min(100, ((totalConsumption - currentLevelData.min) / (nextLevelData.min - currentLevelData.min) * 100)) : 100;

  const pointsToNext = nextLevelData ? 
    Math.max(0, nextLevelData.min - totalConsumption) : 0;

  const benefits = {
    silver: [
      { icon: Gift, title: '参展优惠', desc: '展位费9.5折优惠' },
      { icon: Calendar, title: '会议报名', desc: '优先报名同期论坛' },
      { icon: CreditCard, title: '餐饮折扣', desc: '餐饮消费9折优惠' },
    ],
    gold: [
      { icon: ArrowRight, title: '展位升级', desc: '免费升级展位（每届1次）' },
      { icon: Zap, title: '广告优先', desc: '优先选择广告位' },
      { icon: Gift, title: '参展优惠', desc: '展位费9折优惠' },
      { icon: Calendar, title: '会议VIP', desc: '论坛VIP座位优先' },
      { icon: CreditCard, title: '餐饮折扣', desc: '餐饮消费8.5折优惠' },
    ],
    diamond: [
      { icon: Sparkles, title: '专属客服', desc: '1对1专属客户服务' },
      { icon: ArrowRight, title: '展位升级', desc: '免费升级展位（每届2次）' },
      { icon: Zap, title: '黄金广告', desc: '优先选择黄金广告位' },
      { icon: Gift, title: '参展优惠', desc: '展位费8.5折优惠' },
      { icon: Headphones, title: '贵宾通道', desc: '展馆VIP快速通道' },
      { icon: BadgeCheck, title: '会议VIP', desc: '所有论坛VIP座位' },
      { icon: CreditCard, title: '餐饮折扣', desc: '餐饮消费8折优惠' },
    ]
  };

  const handleRecharge = async (amount: number) => {
    if (!currentUser) return;
    const success = await recharge(amount);
    if (success) {
      alert(`充值成功！充值¥${amount}`);
    } else {
      alert('充值失败，请重试');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className={`rounded-3xl p-8 text-white relative overflow-hidden ${
          currentLevel === 'diamond' ? 'bg-gradient-to-br from-purple-600 to-indigo-700' :
          currentLevel === 'gold' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
          'bg-gradient-to-br from-gray-500 to-gray-700'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8" />
                <span className="text-xl font-bold">{getMemberLevelName(currentLevel)}会员</span>
              </div>
              <span className="text-white/80 text-sm">NO.{currentUser?.id?.toUpperCase()}</span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">{currentUser?.username}</h2>
              <p className="text-white/70">{currentUser?.company || (currentUser?.role === 'exhibitor' ? '参展商' : '专业观众')}</p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">累计消费</p>
                <p className="text-3xl font-bold">{totalConsumption.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm mb-1">账户余额</p>
                <p className="text-2xl font-bold">¥{(currentUser?.balance || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {nextLevelData && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                升级进度
              </h3>
              <span className="text-sm text-gray-500">
                再消费 <span className="text-primary-600 font-medium">¥{pointsToNext.toLocaleString()}</span> 升级
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMemberLevelColor(currentLevel)} text-white`}>
                {currentLevelData.label}
              </span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getMemberLevelColor(currentLevel)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${nextLevel ? getMemberLevelColor(nextLevel) + ' text-white' : 'text-gray-500'}`}>
                {nextLevelData?.label || '最高等级'}
              </span>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <Star className="w-4 h-4 inline mr-1 text-blue-600" />
                会员等级规则：消费满¥10,000升级金卡，满¥50,000升级钻石卡
              </p>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary-600" />
            专属权益
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits[currentLevel as keyof typeof benefits].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-500">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            快速充值
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[100, 500, 1000, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => handleRecharge(amount)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition text-center group"
              >
                <p className="text-2xl font-bold text-gray-900 group-hover:text-primary-600">¥{amount}</p>
                <p className="text-xs text-gray-500 mt-1">赠{Math.floor(amount * 0.1)}积分</p>
              </button>
            ))}
          </div>
          <div className="p-4 bg-green-50 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              充值金额同时计入消费总额，每消费1元累计1元，用于会员等级升级
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary-600" />
            等级说明
          </h3>
          <div className="space-y-4">
            {Object.entries(levelThresholds).map(([level, data]) => {
              const isActive = currentLevel === level;
              return (
                <div
                  key={level}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                    isActive ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMemberLevelColor(level)}`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{data.label}</h4>
                      {isActive && (
                        <span className="badge bg-primary-600 text-white">当前等级</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {data.max === Infinity ? 
                        `${data.min.toLocaleString()}元及以上` : 
                        `${data.min.toLocaleString()} - ${data.max.toLocaleString()}元`
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberCenter;
