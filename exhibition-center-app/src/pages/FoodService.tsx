import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import {
  UtensilsCrossed, ShoppingCart, Plus, Minus,
  CreditCard, Wallet, Clock, CheckCircle,
  MapPin, Coffee, Sandwich, Cookie, IceCream
} from 'lucide-react';
import { api } from '../utils/api';
import type { FoodItem, Order, OrderItem } from '../types';

interface CartItem extends OrderItem {
  foodItem: FoodItem;
}

const FoodService: React.FC = () => {
  const { currentUser, refreshUser } = useApp();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastPickupCode, setLastPickupCode] = useState('');

  const categories = [
    { value: 'all', label: '全部', icon: UtensilsCrossed },
    { value: 'meal', label: '正餐', icon: Sandwich },
    { value: 'snack', label: '小吃', icon: Cookie },
    { value: 'beverage', label: '饮品', icon: Coffee },
    { value: 'dessert', label: '甜点', icon: IceCream },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, ordersData] = await Promise.all([
        api.food.getItems(),
        api.food.getMyOrders()
      ]);
      setFoodItems(itemsData as FoodItem[]);
      setMyOrders(ordersData as Order[]);
    } catch (err) {
      console.error('加载数据失败:', err);
      const mockItems: FoodItem[] = [
        { id: 'f1', name: '红烧牛肉面', description: '精选牛腩，浓郁汤底', price: 38, category: 'meal', available: true, location: 'A区餐饮', restaurant: '面馆' },
        { id: 'f2', name: '宫保鸡丁饭', description: '经典川菜，香辣可口', price: 32, category: 'meal', available: true, location: 'A区餐饮', restaurant: '川菜馆' },
        { id: 'f3', name: '美式咖啡', description: '现磨咖啡豆，香浓醇厚', price: 25, category: 'beverage', available: true, location: 'B区咖啡', restaurant: '咖啡厅' },
        { id: 'f4', name: '提拉米苏', description: '意式经典甜点', price: 28, category: 'dessert', available: true, location: 'C区甜品', restaurant: '甜品站' },
        { id: 'f5', name: '香煎饺子', description: '猪肉白菜馅，外酥里嫩', price: 18, category: 'snack', available: true, location: 'A区餐饮', restaurant: '饺子馆' },
      ];
      setFoodItems(mockItems);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = foodItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (item: FoodItem) => {
    const existing = cart.find(c => c.foodItemId === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.foodItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, {
        foodItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        foodItem: item
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(c => c.foodItemId === itemId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => 
        c.foodItemId === itemId ? { ...c, quantity: c.quantity - 1 } : c
      ));
    } else {
      setCart(cart.filter(c => c.foodItemId !== itemId));
    }
  };

  const getCartItemCount = (itemId: string) => {
    return cart.find(c => c.foodItemId === itemId)?.quantity || 0;
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    if (cartTotal > (currentUser.balance || 0)) {
      alert('余额不足，请先充值');
      return;
    }

    try {
      const orderItems = cart.map(c => ({
        foodItemId: c.foodItemId,
        name: c.name,
        price: c.price,
        quantity: c.quantity
      }));
      
      const result: any = await api.food.createOrder(orderItems);
      setLastPickupCode(result.pickupCode || String(Math.floor(1000 + Math.random() * 9000)));
      setOrderSuccess(true);
      await refreshUser();
      loadData();
      
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCart(false);
        setCart([]);
      }, 3000);
    } catch (err: any) {
      alert(err.message || '下单失败');
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">账户余额</p>
              <p className="text-3xl font-bold mt-1">¥{(currentUser?.balance || 0).toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                  activeCategory === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const count = getCartItemCount(item.id);
            return (
              <div key={item.id} className="card hover:shadow-md transition">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl mb-4 flex items-center justify-center">
                  <UtensilsCrossed className="w-12 h-12 text-orange-400" />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <span className="text-lg font-bold text-primary-600">¥{item.price}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                  {count === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-medium">{count}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary-700 transition flex items-center gap-3"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">¥{cartTotal}</span>
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {cart.reduce((sum, c) => sum + c.quantity, 0)}
              </span>
            </button>
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 sm:items-center">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                  我的订单
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>购物车是空的</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.foodItemId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">¥{item.price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.foodItemId)}
                          className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.foodItem)}
                          className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">合计</span>
                  <span className="text-2xl font-bold text-primary-600">¥{cartTotal}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  余额支付
                </button>
                <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  预计15-20分钟可取餐
                </p>
              </div>
            </div>
          </div>
        )}

        {orderSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">下单成功！</h3>
              <p className="text-gray-500 mb-4">请凭取餐码到对应门店取餐</p>
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">取餐码</p>
                <p className="text-3xl font-bold text-primary-600">
                  {lastPickupCode}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FoodService;
