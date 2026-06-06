import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../utils/api';
import type { User, Booth, Product, Conference, FoodItem, Notification } from '../types';

interface MemberInfo {
  level: string;
  nextThreshold: number | null;
  pointsToNext: number;
}

interface AppContextType {
  currentUser: User | null;
  memberInfo: MemberInfo | null;
  loading: boolean;
  notifications: Notification[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  recharge: (amount: number) => Promise<boolean>;
  loadNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data: any = await api.auth.getMe();
      setCurrentUser(data.user);
      setMemberInfo(data.memberInfo);
    } catch (err) {
      console.error('加载用户信息失败:', err);
      localStorage.removeItem('token');
      api.clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data: any = await api.auth.login(username, password);
      api.setToken(data.token);
      setCurrentUser(data.user);
      setMemberInfo(data.memberInfo);
      return true;
    } catch (err: any) {
      console.error('登录失败:', err.message);
      return false;
    }
  };

  const logout = () => {
    api.clearToken();
    setCurrentUser(null);
    setMemberInfo(null);
    localStorage.removeItem('token');
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const data: any = await api.auth.register(userData);
      api.setToken(data.token);
      setCurrentUser(data.user);
      setMemberInfo(data.memberInfo);
      return true;
    } catch (err: any) {
      console.error('注册失败:', err.message);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const data: any = await api.auth.getMe();
      setCurrentUser(data.user);
      setMemberInfo(data.memberInfo);
    } catch (err) {
      console.error('刷新用户信息失败:', err);
    }
  };

  const recharge = async (amount: number): Promise<boolean> => {
    try {
      const data: any = await api.auth.recharge(amount);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          balance: data.balance,
          memberPoints: data.memberPoints
        });
      }
      await refreshUser();
      return true;
    } catch (err) {
      console.error('充值失败:', err);
      return false;
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data as any);
    } catch (err) {
      console.error('加载通知失败:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      memberInfo,
      loading,
      notifications,
      login,
      logout,
      register,
      refreshUser,
      recharge,
      loadNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
