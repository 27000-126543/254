import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  MapPin, Search, Filter, Zap, FileText, CheckCircle,
  Square, Layers, TrendingUp, Clock, Star
} from 'lucide-react';
import { getIndustryName } from '../data/mockData';
import type { Booth, Industry } from '../types';

const BoothManagement: React.FC = () => {
  const { booths, currentUser, exhibitors, updateBooth, addContract, addNotification, updateUser } = useApp();
  const [selectedHall, setSelectedHall] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);

  const currentExhibitor = exhibitors.find(e => e.userId === currentUser?.id);

  const halls = [...new Set(booths.map(b => b.hall))];
  const sizes = ['9', '18', '36', '54'];
  const industries = ['electronics', 'machinery', 'textile', 'food', 'medical', 'automotive', 'building', 'energy'];

  const filteredBooths = useMemo(() => {
    return booths.filter(booth => {
      if (selectedHall !== 'all' && booth.hall !== selectedHall) return false;
      if (selectedSize !== 'all' && booth.size !== selectedSize) return false;
      if (selectedIndustry !== 'all' && booth.industry !== selectedIndustry) return false;
      if (searchTerm && !booth.boothNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [booths, selectedHall, selectedSize, selectedIndustry, searchTerm]);

  const recommendedBooths = useMemo(() => {
    if (!currentExhibitor) return [];
    const available = booths.filter(b => b.status === 'available');
    return available
      .map(b => ({
        ...b,
        score: (b.historicalTraffic / 4000) * 0.5 + (b.industry === currentExhibitor.industry ? 0.3 : 0) + (b.area >= 36 ? 0.2 : 0)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [booths, currentExhibitor]);

  const handleReserve = (booth: Booth) => {
    if (!currentUser || !currentExhibitor) return;
    if (currentUser.balance && currentUser.balance < booth.price) {
      alert('余额不足，请先充值');
      return;
    }

    const updatedBooth = { ...booth, status: 'reserved' as const, exhibitorId: currentExhibitor.id };
    updateBooth(updatedBooth);

    const updatedUser = { ...currentUser, balance: (currentUser.balance || 0) - booth.price };
    updateUser(updatedUser);

    const newContract = {
      id: `ct${Date.now()}`,
      exhibitorId: currentExhibitor.id,
      boothId: booth.id,
      amount: booth.price,
      startDate: '2024-12-20',
      endDate: '2024-12-23',
      status: 'draft' as const,
      content: `展位租赁合同\n\n甲方（出租方）：国际会展中心\n乙方（承租方）：${currentExhibitor.companyName}\n\n展位信息：\n展位号：${booth.boothNumber}\n展馆：${booth.hall} ${booth.zone}\n面积：${booth.area}㎡\n租金：¥${booth.price.toLocaleString()}\n\n租赁期限：2024年12月20日至2024年12月23日\n\n合同条款：...`
    };
    addContract(newContract);

    addNotification({
      userId: currentUser.id,
      title: '展位预订成功',
      content: `您已成功预订${booth.boothNumber}展位，请及时确认电子合同`,
      type: 'success'
    });

    setSelectedBooth(updatedBooth);
    setShowContract(true);
  };

  const handleSignContract = () => {
    setContractSigned(true);
    if (selectedBooth) {
      updateBooth({ ...selectedBooth, status: 'sold' });
      addNotification({
        userId: currentUser!.id,
        title: '合同签署完成',
        content: '展位合同已生效，祝您参展顺利！',
        type: 'success'
      });
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
        {/* 智能推荐展位 */}
        {currentExhibitor && recommendedBooths.length > 0 && (
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6" />
              <h3 className="text-lg font-semibold">为您智能推荐</h3>
            </div>
            <p className="text-primary-100 mb-4">
              基于历届流量数据和您的展品类别，为您推荐以下最优展位
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedBooths.map(booth => (
                <div key={booth.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{booth.boothNumber}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                      <span className="text-sm">{Math.round(booth.score * 100)}分</span>
                    </div>
                  </div>
                  <p className="text-sm text-primary-100 mb-2">
                    {booth.hall} {booth.zone} · {booth.area}㎡
                  </p>
                  <p className="text-sm text-primary-100 mb-3">
                    历届平均流量：{booth.historicalTraffic}人次
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl">¥{booth.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleReserve(booth)}
                      disabled={booth.status !== 'available'}
                      className="px-4 py-1.5 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      立即预订
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 筛选区域 */}
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

        {/* 展位平面图示意 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            展位分布
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredBooths.map(booth => (
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
                <p className="text-sm font-semibold text-primary-600 mt-2">¥{booth.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 选中的展位详情 */}
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
                  ¥{selectedBooth.price.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                {selectedBooth.status === 'available' && (
                  <button
                    onClick={() => handleReserve(selectedBooth)}
                    className="btn btn-primary"
                  >
                    立即预订
                  </button>
                )}
                {(selectedBooth.status === 'reserved' || selectedBooth.status === 'sold') && (
                  <button
                    onClick={() => setShowContract(true)}
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

        {/* 电子合同弹窗 */}
        {showContract && (
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
                  {selectedBooth && currentExhibitor && `展位租赁合同

甲方（出租方）：国际会展中心
乙方（承租方）：${currentExhibitor.companyName}

一、展位信息
展位号：${selectedBooth.boothNumber}
展馆：${selectedBooth.hall} ${selectedBooth.zone}
面积：${selectedBooth.area}平方米
展位用途：${getIndustryName(selectedBooth.industry)}产品展示

二、租赁期限
自2024年12月20日起至2024年12月23日止，共计4天。

三、费用及支付
展位租金：人民币${selectedBooth.price.toLocaleString()}元整
支付方式：从账户余额中扣除

四、双方权利与义务
1. 甲方保证场地符合展览标准，提供基本设施
2. 乙方应按时支付费用，遵守展馆管理规定
3. 乙方不得擅自转租、改变展位用途
4. 展会期间乙方应自行负责展品安全

五、违约责任
任何一方违约，应承担相应的违约责任...

六、争议解决
本合同履行过程中发生的争议，双方应友好协商解决...`}
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                {!contractSigned ? (
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
                    <span className="font-medium">合同已签署</span>
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
