import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  MapPin, Search, Filter, Zap, FileText, CheckCircle,
  Square, Layers, TrendingUp
} from 'lucide-react';
import { api } from '../utils/api';
import { getIndustryName } from '../data/mockData';
import type { Booth, Contract } from '../types';

const BoothManagement: React.FC = () => {
  const { currentUser, refreshUser } = useApp();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [recommendedBooths, setRecommendedBooths] = useState<any[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);

  const halls = ['1号馆', '2号馆', '3号馆', '4号馆'];
  const sizes = ['9', '18', '36', '54'];
  const industries = ['electronics', 'machinery', 'textile', 'food', 'medical', 'automotive', 'building', 'energy'];

  const loadBooths = async () => {
    try {
      const params: any = {};
      if (selectedHall !== 'all') params.hall = selectedHall;
      if (selectedSize !== 'all') params.size = selectedSize;
      if (selectedIndustry !== 'all') params.industry = selectedIndustry;
      const data: any = await api.booths.getAll(params);
      setBooths(data.filter((b: Booth) => 
        !searchTerm || b.boothNumber.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } catch (err) {
      console.error('加载展位失败:', err);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data: any = await api.booths.getRecommendations();
      setRecommendedBooths(data);
    } catch (err) {
      console.error('加载推荐展位失败:', err);
    }
  };

  const loadContracts = async () => {
    try {
      const data: any = await api.booths.getMyContracts();
      setContracts(data);
    } catch (err) {
      console.error('加载合同失败:', err);
    }
  };

  useEffect(() => {
    loadBooths();
    if (currentUser?.role === 'exhibitor') {
      loadRecommendations();
      loadContracts();
    }
  }, [selectedHall, selectedSize, selectedIndustry, currentUser?.role]);

  useEffect(() => {
    if (searchTerm) {
      loadBooths();
    }
  }, [searchTerm]);

  const handleReserve = async (booth: Booth) => {
    if (!currentUser) return;
    if (currentUser.balance && currentUser.balance < booth.price) {
      alert('余额不足，请先充值');
      return;
    }

    setLoading(true);
    try {
      const result: any = await api.booths.reserve(booth.id);
      if (result.success) {
        setSelectedBooth(result.booth);
        setCurrentContract(result.contract);
        setShowContract(true);
        await refreshUser();
        await loadBooths();
        await loadContracts();
      }
    } catch (err: any) {
      alert(err.message || '预订失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!currentContract) return;
    try {
      const result: any = await api.booths.signContract(currentContract.id);
      if (result.success) {
        setContractSigned(true);
        await loadBooths();
        await loadContracts();
      }
    } catch (err: any) {
      alert(err.message || '签署失败');
    }
  };

  const getBoothStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'sold': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBoothStatusText = (status: string) => {
    switch (status) {
      case 'available': return '可预订';
      case 'reserved': return '已预留';
      case 'sold': return '已售出';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {currentUser?.role === 'exhibitor' && recommendedBooths.length > 0 && (
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6" />
              <h3 className="text-lg font-semibold">为您智能推荐</h3>
            </div>
            <p className="text-primary-100 mb-4">
              基于历届流量数据和您的展品类别，为您推荐以下最优展位
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedBooths.map((booth: any) => (
                <div key={booth.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{booth.boothNumber}</span>
                    <span className="text-sm">推荐指数 {booth.score}分</span>
                  </div>
                  <p className="text-sm text-primary-100 mb-2">
                    {booth.hall} {booth.zone} · {booth.area}㎡
                  </p>
                  <p className="text-sm text-primary-100 mb-3">
                    历届平均流量：{booth.historicalTraffic}人次
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl">¥{booth.price?.toLocaleString()}</span>
                    <button
                      onClick={() => handleReserve(booth)}
                      disabled={booth.status !== 'available' || loading}
                      className="px-4 py-1.5 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      {loading ? '预订中...' : '立即预订'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索展位号..."
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="input w-auto"
              >
                <option value="all">全部展馆</option>
                {halls.map(hall => (
                  <option key={hall} value={hall}>{hall}</option>
                ))}
              </select>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="input w-auto"
              >
                <option value="all">全部面积</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}㎡</option>
                ))}
              </select>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="input w-auto"
              >
                <option value="all">全部行业</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{getIndustryName(ind)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            展位分布
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {booths.map(booth => (
              <div
                key={booth.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedBooth?.id === booth.id
                    ? 'border-primary-500 bg-primary-50'
                    : booth.status === 'available'
                    ? 'border-green-200 bg-green-50 hover:border-green-300'
                    : booth.status === 'reserved'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
                }`}
                onClick={() => setSelectedBooth(booth)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{booth.boothNumber}</span>
                  <Square className={`w-4 h-4 ${
                    booth.status === 'available' ? 'text-green-500' :
                    booth.status === 'reserved' ? 'text-yellow-500' : 'text-red-500'
                  }`} fill="currentColor" />
                </div>
                <p className="text-xs text-gray-500 mb-1">{booth.hall} {booth.zone}</p>
                <p className="text-xs text-gray-500">{booth.area}㎡ · {getIndustryName(booth.industry)}</p>
                <p className="text-sm font-semibold text-primary-600 mt-2">¥{booth.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedBooth && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              展位详情 - {selectedBooth.boothNumber}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">展馆位置</p>
                <p className="text-xl font-bold">{selectedBooth.hall}</p>
                <p className="text-sm text-gray-500">{selectedBooth.zone}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">展位面积</p>
                <p className="text-xl font-bold">{selectedBooth.area}㎡</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">所属行业</p>
                <p className="text-xl font-bold">{getIndustryName(selectedBooth.industry)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">历届流量</p>
                <p className="text-xl font-bold">{selectedBooth.historicalTraffic}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  人次
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className={`badge border ${getBoothStatusColor(selectedBooth.status)}`}>
                  {getBoothStatusText(selectedBooth.status)}
                </span>
                <span className="text-3xl font-bold text-primary-600 ml-4">
                  ¥{selectedBooth.price?.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-4">
                  当前余额: ¥{(currentUser?.balance || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                {selectedBooth.status === 'available' && (
                  <button
                    onClick={() => handleReserve(selectedBooth)}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? '预订中...' : '立即预订'}
                  </button>
                )}
                {(selectedBooth.status === 'reserved' || selectedBooth.status === 'sold') && contracts.length > 0 && (
                  <button
                    onClick={() => {
                      const contract = contracts.find(c => c.boothId === selectedBooth.id);
                      if (contract) {
                        setCurrentContract(contract);
                        setShowContract(true);
                      }
                    }}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    查看合同
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showContract && currentContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  电子合同
                </h3>
                <button
                  onClick={() => { setShowContract(false); setContractSigned(false); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="p-6 max-h-[50vh] overflow-y-auto">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {currentContract.content || `展位租赁合同

甲方（出租方）：国际会展中心
乙方（承租方）：展商

一、展位信息
展位号：${selectedBooth?.boothNumber}
展馆：${selectedBooth?.hall} ${selectedBooth?.zone}
面积：${selectedBooth?.area}平方米

二、租赁期限
自2024年12月20日起至2024年12月23日止，共计4天。

三、费用及支付
展位租金：人民币${currentContract.amount?.toLocaleString()}元整

四、合同条款
...`}
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                {!contractSigned && currentContract.status === 'draft' ? (
                  <>
                    <button
                      onClick={() => setShowContract(false)}
                      className="btn btn-secondary"
                    >
                      稍后确认
                    </button>
                    <button
                      onClick={handleSignContract}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      确认签署
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {currentContract.status === 'signed' ? '合同已签署' : '合同待签署'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BoothManagement;
