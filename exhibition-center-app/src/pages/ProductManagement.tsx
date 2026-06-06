import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  Package, Plus, Edit2, Trash2, Users, Target,
  Calendar, MapPin, CheckCircle, Clock, XCircle,
  MessageSquare, Star
} from 'lucide-react';
import { api } from '../utils/api';
import type { Product, BusinessMeeting } from '../types';

interface PotentialBuyer {
  id: string;
  name: string;
  email: string;
  interestedIndustries: string[];
  matchScore: number;
}

const ProductManagement: React.FC = () => {
  const { currentUser } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [meetings, setMeetings] = useState<BusinessMeeting[]>([]);
  const [potentialBuyers, setPotentialBuyers] = useState<PotentialBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, meetingsData, buyersData] = await Promise.all([
        api.products.getMy(),
        api.products.getMyMeetings(),
        api.products.getPotentialBuyers()
      ]);
      setProducts(productsData as Product[]);
      setMeetings(meetingsData as BusinessMeeting[]);
      setPotentialBuyers(buyersData as PotentialBuyer[]);
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      await api.products.create({
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        tags: newProduct.tags.split(',').map(t => t.trim())
      });
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', category: '', tags: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || '发布失败');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定删除该展品吗？')) return;
    try {
      await api.products.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleScheduleMeeting = async (buyer: PotentialBuyer) => {
    try {
      await api.products.createMeeting({
        visitorId: buyer.id,
        scheduledTime: '2024-12-20 14:00',
        location: '1号馆商务洽谈区B'
      });
      alert('洽谈邀请已发送');
      loadData();
    } catch (err: any) {
      alert(err.message || '预约失败');
    }
  };

  const handleUpdateMeetingStatus = async (id: string, status: string) => {
    try {
      await api.products.updateMeetingStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMeetingStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'pending': return '待确认';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              展品管理
            </h3>
            <button
              onClick={() => setShowAddProduct(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              发布展品
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无展品，点击上方按钮发布</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{product.category}</span>
                    <div className="flex gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary-600" />
            智能匹配潜在买家
          </h3>
          <p className="text-gray-500 mb-4">
            基于产品标签和观众画像，为您自动匹配潜在买家
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {potentialBuyers.map((buyer) => (
              <div key={buyer.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">
                        {buyer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{buyer.name}</h4>
                      <p className="text-sm text-gray-500">{buyer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className="text-sm font-medium">{buyer.matchScore}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {buyer.interestedIndustries.map((ind: string) => (
                    <span key={ind} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {ind}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleScheduleMeeting(buyer)}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  预约洽谈
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            商务洽谈日程
          </h3>
          {meetings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无洽谈安排</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map(meeting => (
                <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{(meeting as any).visitorName || '潜在买家'}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.scheduledTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getMeetingStatusColor(meeting.status)}`}>
                      {getMeetingStatusText(meeting.status)}
                    </span>
                    {meeting.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateMeetingStatus(meeting.id, 'confirmed')}
                        className="btn btn-primary text-xs py-1 px-2"
                      >
                        确认
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-semibold">发布展品</h3>
                <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">展品名称</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="input"
                    placeholder="请输入展品名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">展品类别</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="input"
                    placeholder="如：传感器、检测设备"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品描述</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="input h-24 resize-none"
                    placeholder="请输入产品描述"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={newProduct.tags}
                    onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                    className="input"
                    placeholder="如：IoT, 智能制造, 工业4.0"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowAddProduct(false)} className="btn btn-secondary">
                  取消
                </button>
                <button onClick={handleAddProduct} className="btn btn-primary">
                  发布
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductManagement;
