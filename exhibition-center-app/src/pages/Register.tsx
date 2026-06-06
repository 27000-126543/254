import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Lock, Mail, Phone, Building, ChevronLeft } from 'lucide-react';
import { industryList } from '../data/mockData';
import type { Industry, UserRole } from '../types';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('visitor');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    company: '',
    industry: 'electronics' as Industry,
    interestedIndustries: [] as Industry[]
  });
  const [error, setError] = useState('');
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    const success = register({
      ...formData,
      role
    });
    if (success) {
      navigate('/login');
    } else {
      setError('用户名已存在');
    }
  };

  const toggleIndustry = (industry: Industry) => {
    setFormData(prev => ({
      ...prev,
      interestedIndustries: prev.interestedIndustries.includes(industry)
        ? prev.interestedIndustries.filter(i => i !== industry)
        : [...prev.interestedIndustries, industry]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft className="w-5 h-5" />
            返回登录
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">注册账户</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">请选择您的身份</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { value: 'exhibitor', label: '参展商', icon: Building, desc: '预订展位、展示产品' },
                  { value: 'visitor', label: '专业观众', icon: User, desc: '参观展会、预约洽谈' },
                ].map(item => (
                  <button
                    key={item.value}
                    onClick={() => setRole(item.value as UserRole)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      role === item.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className={`w-8 h-8 mb-3 ${role === item.value ? 'text-primary-600' : 'text-gray-400'}`} />
                    <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary w-full">
                下一步
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold mb-6">填写账户信息</h2>
              
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="请输入手机号"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="请输入邮箱"
                  required
                />
              </div>

              {role === 'exhibitor' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="input"
                      placeholder="请输入公司名称"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所属行业</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                      className="input"
                    >
                      {industryList.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {role === 'visitor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">感兴趣的行业（可多选）</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {industryList.map(ind => (
                      <button
                        key={ind.value}
                        type="button"
                        onClick={() => toggleIndustry(ind.value as Industry)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.interestedIndustries.includes(ind.value as Industry)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    placeholder="请输入密码"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input"
                    placeholder="请确认密码"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                  上一步
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  注册
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
