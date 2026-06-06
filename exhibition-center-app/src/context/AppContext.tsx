import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Booth, Exhibitor, Visitor, BusinessMeeting, Conference, FoodItem, Order, Notification, Contract } from '../types';
import { mockUsers, mockBooths, mockExhibitors, mockVisitors, mockMeetings, mockConferences, mockFoodItems, mockOrders, mockNotifications, mockContracts } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  booths: Booth[];
  exhibitors: Exhibitor[];
  visitors: Visitor[];
  meetings: BusinessMeeting[];
  conferences: Conference[];
  foodItems: FoodItem[];
  orders: Order[];
  notifications: Notification[];
  contracts: Contract[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Partial<User> & { role: string }) => boolean;
  updateUser: (user: User) => void;
  updateBooth: (booth: Booth) => void;
  addOrder: (order: Order) => void;
  addMeeting: (meeting: BusinessMeeting) => void;
  registerConference: (conferenceId: string, userId: string) => boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  addContract: (contract: Contract) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [booths, setBooths] = useState<Booth[]>(mockBooths);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>(mockExhibitors);
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
  const [meetings, setMeetings] = useState<BusinessMeeting[]>(mockMeetings);
  const [conferences, setConferences] = useState<Conference[]>(mockConferences);
  const [foodItems] = useState<FoodItem[]>(mockFoodItems);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = (userData: Partial<User> & { role: string }): boolean => {
    if (users.find(u => u.username === userData.username)) {
      return false;
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      username: userData.username || '',
      password: userData.password || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role as User['role'],
      company: userData.company,
      memberLevel: 'silver',
      memberPoints: 0,
      exhibitionCount: 0,
      totalConsumption: 0,
      balance: 0,
      interestedIndustries: userData.interestedIndustries,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);

    if (userData.role === 'exhibitor') {
      const newExhibitor: Exhibitor = {
        id: `e${Date.now()}`,
        userId: newUser.id,
        companyName: userData.company || '',
        industry: (userData as any).industry || 'electronics',
        description: '',
        products: [],
        meetings: []
      };
      setExhibitors([...exhibitors, newExhibitor]);
    } else if (userData.role === 'visitor') {
      const newVisitor: Visitor = {
        id: `v${Date.now()}`,
        userId: newUser.id,
        name: userData.username || '',
        interestedIndustries: userData.interestedIndustries || [],
        visitedExhibitors: [],
        bookedMeetings: [],
        ticketCode: `TICKET${Date.now()}`
      };
      setVisitors([...visitors, newVisitor]);
    }

    return true;
  };

  const updateUser = (user: User) => {
    setUsers(users.map(u => u.id === user.id ? user : u));
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  };

  const updateBooth = (booth: Booth) => {
    setBooths(booths.map(b => b.id === booth.id ? booth : b));
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const addMeeting = (meeting: BusinessMeeting) => {
    setMeetings([...meetings, meeting]);
  };

  const registerConference = (conferenceId: string, userId: string): boolean => {
    const conference = conferences.find(c => c.id === conferenceId);
    if (!conference || conference.registeredCount >= conference.totalSeats) {
      return false;
    }
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    const seatNumber = `A${String(conference.registeredCount + 1).padStart(3, '0')}`;
    const newAssignment = {
      id: `sa${Date.now()}`,
      conferenceId,
      userId,
      seatNumber,
      memberLevel: user.memberLevel,
      registeredAt: new Date().toISOString()
    };

    setConferences(conferences.map(c => 
      c.id === conferenceId 
        ? { ...c, registeredCount: c.registeredCount + 1, seatAssignments: [...c.seatAssignments, newAssignment] }
        : c
    ));
    return true;
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN'),
      read: false
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addContract = (contract: Contract) => {
    setContracts([...contracts, contract]);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, booths, exhibitors, visitors, meetings, conferences,
      foodItems, orders, notifications, contracts,
      login, logout, register, updateUser, updateBooth, addOrder, addMeeting,
      registerConference, addNotification, markNotificationRead, addContract
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
