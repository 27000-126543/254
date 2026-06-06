const API_BASE = 'http://localhost:4000/api';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[toCamelCase(key)] = convertKeysToCamelCase(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return convertKeysToCamelCase(data);
  }

  auth = {
    login: (username: string, password: string) => 
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    
    register: (data: any) =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getMe: () => this.request('/auth/me'),
    
    updateMe: (data: any) =>
      this.request('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    recharge: (amount: number) =>
      this.request('/auth/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  };

  booths = {
    getAll: (params?: { hall?: string; size?: string; industry?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.hall) query.set('hall', params.hall);
      if (params?.size) query.set('size', params.size);
      if (params?.industry) query.set('industry', params.industry);
      if (params?.status) query.set('status', params.status);
      return this.request(`/booths?${query.toString()}`);
    },
    
    getOne: (id: string) => this.request(`/booths/${id}`),
    
    getRecommendations: () => this.request('/booths/recommend/list'),
    
    reserve: (id: string) =>
      this.request(`/booths/${id}/reserve`, {
        method: 'POST',
      }),
    
    signContract: (contractId: string) =>
      this.request(`/booths/contract/${contractId}/sign`, {
        method: 'POST',
      }),
    
    getMyContracts: () => this.request('/booths/my/contracts'),
  };

  products = {
    getMy: () => this.request('/products/my'),
    
    create: (data: any) =>
      this.request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) =>
      this.request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      this.request(`/products/${id}`, {
        method: 'DELETE',
      }),
    
    getPotentialBuyers: () => this.request('/products/matches/potential-buyers'),
    
    getMyMeetings: () => this.request('/products/meetings/my'),
    
    createMeeting: (data: any) =>
      this.request('/products/meetings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    updateMeetingStatus: (id: string, status: string) =>
      this.request(`/products/meetings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  };

  conferences = {
    getAll: (params?: { status?: string; industry?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.industry) query.set('industry', params.industry);
      return this.request(`/conferences?${query.toString()}`);
    },
    
    getOne: (id: string) => this.request(`/conferences/${id}`),
    
    register: (id: string) =>
      this.request(`/conferences/${id}/register`, {
        method: 'POST',
      }),
  };

  food = {
    getItems: (category?: string) => {
      const query = category ? `?category=${category}` : '';
      return this.request(`/food/items${query}`);
    },
    
    createOrder: (items: any[], paymentMethod = 'balance') =>
      this.request('/food/order', {
        method: 'POST',
        body: JSON.stringify({ items, paymentMethod }),
      }),
    
    getMyOrders: () => this.request('/food/orders/my'),
  };

  heatmap = {
    get: (hall?: string) => {
      const query = hall ? `?hall=${hall}` : '';
      return this.request(`/heatmap${query}`);
    },
    
    getStats: () => this.request('/heatmap/stats'),
  };

  notifications = {
    getAll: (unread?: boolean) => {
      const query = unread ? '?unread=true' : '';
      return this.request(`/notifications${query}`);
    },
    
    markRead: (id: string) =>
      this.request(`/notifications/${id}/read`, {
        method: 'PUT',
      }),
    
    markAllRead: () =>
      this.request('/notifications/read-all', {
        method: 'PUT',
      }),
    
    getUnreadCount: () => this.request('/notifications/unread-count'),
  };

  admin = {
    getOverview: () => this.request('/admin/overview'),
    getDailyStats: () => this.request('/admin/daily-stats'),
    getExhibitors: () => this.request('/admin/exhibitors'),
    getIndustryTrends: () => this.request('/admin/industry-trends'),
    getMonthlyReport: (month?: string) => {
      const query = month ? `?month=${month}` : '';
      return this.request(`/admin/reports/monthly${query}`);
    },
  };
}

export const api = new ApiClient();
