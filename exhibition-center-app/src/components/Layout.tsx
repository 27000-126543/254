import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, LayoutDashboard, MapPin, Users, Calendar,
  UtensilsCrossed, Crown, BarChart3, FileText, Settings,
  LogOut, Bell, QrCode, MessageSquare
} from 'lucide-react';
import { getMemberLevelName, getMemberLevelColor } from '../data/mockData';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const exhibitorMenu = [
    { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
    { path: '/booth', label: '展位管理', icon: MapPin },
    { path: '/products', label: '展品管理', icon: Building2 },
    { path: '/meetings', label: '商务洽谈', icon: MessageSquare },
    { path: '/conferences', label: '会议论坛', icon: Calendar },
    { path: '/food', label: '餐饮服务', icon: UtensilsCrossed },
    { path: '/member', label: '会员中心', icon: Crown },
  ];

  const visitorMenu = [
    { path: '/dashboard', label: '首页', icon: LayoutDashboard },
    { path: '/exhibitors', label: '展商推荐', icon: Users },
    { path: '/heatmap', label: '热力地图', icon: MapPin },
    { path: '/conferences', label: '会议论坛', icon: Calendar },
    { path: '/food', label: '餐饮服务', icon: UtensilsCrossed },
    { path: '/ticket', label: '电子证件', icon: QrCode },
    { path: '/member', label: '会员中心', icon: Crown },
  ];

  const adminMenu = [
    { path: '/dashboard', label: '管理看板', icon: BarChart3 },
    { path: '/analytics', label: '数据分析', icon: BarChart3 },
    { path: '/reports', label: '报表导出', icon: FileText },
    { path: '/conferences', label: '会议管理', icon: Calendar },
    { path: '/settings', label: '系统设置', icon: Settings },
  ];

  const menu = currentUser?.role === 'admin' ? adminMenu 
    : currentUser?.role === 'exhibitor' ? exhibitorMenu 
    : visitorMenu;

  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">会展中心</h1>
              <p className="text-xs text-gray-500">综合管理系统</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {menu.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {menu.find(m => m.path === location.pathname)?.label || '工作台'}
            </h2>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getMemberLevelColor(currentUser?.memberLevel || 'silver')}`}>
                  <span className="text-white font-medium text-sm">
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.username}</p>
                  <p className="text-xs text-gray-500">
                    {getMemberLevelName(currentUser?.memberLevel || 'silver')}
                    {currentUser?.company && ` · ${currentUser.company}`}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
