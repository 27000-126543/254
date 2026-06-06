export type UserRole = 'exhibitor' | 'visitor' | 'admin';
export type MemberLevel = 'silver' | 'gold' | 'diamond';
export type BoothStatus = 'available' | 'reserved' | 'sold';
export type BoothSize = '9' | '18' | '36' | '54';
export type Industry = 'electronics' | 'machinery' | 'textile' | 'food' | 'medical' | 'automotive' | 'building' | 'energy';
export type MeetingStatus = 'upcoming' | 'ongoing' | 'ended';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: UserRole;
  company?: string;
  avatar?: string;
  memberLevel: MemberLevel;
  memberPoints: number;
  exhibitionCount: number;
  totalConsumption: number;
  balance?: number;
  interestedIndustries?: Industry[];
  registeredAt: string;
}

export interface Booth {
  id: string;
  boothNumber: string;
  area: number;
  size: BoothSize;
  hall: string;
  zone: string;
  position: { x: number; y: number };
  price: number;
  status: BoothStatus;
  industry: Industry;
  historicalTraffic: number;
  exhibitorId?: string;
  contractUrl?: string;
}

export interface Exhibitor {
  id: string;
  userId: string;
  companyName: string;
  industry: Industry;
  description: string;
  logo?: string;
  products: Product[];
  boothId?: string;
  meetings: BusinessMeeting[];
}

export interface Product {
  id: string;
  exhibitorId: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  images?: string[];
  price?: string;
}

export interface Visitor {
  id: string;
  userId: string;
  name: string;
  interestedIndustries: Industry[];
  visitedExhibitors: string[];
  bookedMeetings: string[];
  ticketCode?: string;
}

export interface BusinessMeeting {
  id: string;
  exhibitorId: string;
  visitorId: string;
  productId?: string;
  scheduledTime: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Conference {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speakerAvatar?: string;
  startTime: string;
  endTime: string;
  venue: string;
  totalSeats: number;
  registeredCount: number;
  status: MeetingStatus;
  industry: Industry;
  replayUrl?: string;
  seatAssignments: SeatAssignment[];
}

export interface SeatAssignment {
  id: string;
  conferenceId: string;
  userId: string;
  seatNumber: string;
  memberLevel: MemberLevel;
  registeredAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'meal' | 'snack' | 'beverage' | 'dessert';
  image?: string;
  available: boolean;
  restaurant: string;
  location: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  paymentMethod: 'balance' | 'wechat' | 'alipay';
  pickupCode?: string;
}

export interface OrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface HeatMapData {
  boothId: string;
  visitorCount: number;
  queueLength: number;
  timestamp: string;
}

export interface DailyStats {
  date: string;
  totalVisitors: number;
  totalExhibitors: number;
  totalRevenue: number;
  foodSales: number;
  conferenceAttendance: number;
}

export interface Contract {
  id: string;
  exhibitorId: string;
  boothId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'signed' | 'cancelled';
  content: string;
  signedAt?: string;
}

export interface Recommendation {
  type: 'booth' | 'exhibitor' | 'conference' | 'product';
  targetId: string;
  score: number;
  reason: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  read: boolean;
  createdAt: string;
}

export interface IndustryTrend {
  industry: Industry;
  growthRate: number;
  predictedPopularity: number;
  suggestedPrice: number;
}
