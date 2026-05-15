import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { orderService, menuService, restaurantService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import {
  FiPackage, FiClock, FiCheckCircle, FiTruck, FiDollarSign,
  FiList, FiRefreshCw, FiToggleLeft, FiToggleRight, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];

const STATUS_CONFIG = {
  pending:            { label: 'Pending',           color: 'bg-yellow-100 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400' },
  confirmed:          { label: 'Confirmed',          color: 'bg-blue-100 text-blue-700 border-blue-200',        dot: 'bg-blue-400' },
  preparing:          { label: 'Preparing',          color: 'bg-orange-100 text-orange-700 border-orange-200',  dot: 'bg-orange-400' },
  ready:              { label: 'Ready',              color: 'bg-purple-100 text-purple-700 border-purple-200',  dot: 'bg-purple-400' },
  'out-for-delivery': { label: 'Out for Delivery',   color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  delivered:          { label: 'Delivered',          color: 'bg-green-100 text-green-700 border-green-200',     dot: 'bg-green-400' },
  cancelled:          { label: 'Cancelled',          color: 'bg-red-100 text-red-700 border-red-200',           dot: 'bg-red-400' },
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out-for-delivery',
};

const OrderCard = ({ order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const nextStatus = NEXT_STATUS[order.orderStatus];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await orderService.updateStatus(order._id, nextStatus);
      toast.success(`Order marked as ${STATUS_CONFIG[nextStatus].label}`);
      onStatusUpdate();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">#{order.orderNumber}</p>
          <p className="text-sm text-gray-500">{order.customerName}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="space-y-1 mb-3 text-sm text-gray-600">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="font-bold text-orange-500">{formatPrice(order.totalAmount)}</p>
          <p className="text-xs text-gray-400 capitalize">{order.paymentMethod} · {order.paymentStatus}</p>
        </div>
        {nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={updating}
            className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {updating
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FiCheckCircle size={12} />
            }
            Mark as {STATUS_CONFIG[nextStatus].label}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, restaurantRes] = await Promise.all([
        orderService.getRestaurantOrders(),
        restaurantService.getMyRestaurant(),
      ]);
      setOrders(ordersRes.data.orders || []);
      setRestaurant(restaurantRes.data.restaurant);

      if (restaurantRes.data.restaurant?._id) {
        const menuRes = await menuService.getByRestaurant(restaurantRes.data.restaurant._id);
        setMenuItems(menuRes.data.menuItems || menuRes.data.menu || []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleToggleItem = async (itemId) => {
    try {
      await menuService.toggleAvailability(itemId);
      setMenuItems(prev => prev.map(item =>
        item._id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      ));
      toast.success('Item availability updated');
    } catch {
      toast.error('Failed to update item');
    }
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus));
  const filteredOrders = statusFilter === 'active'
    ? activeOrders
    : statusFilter === 'completed'
    ? orders.filter(o => o.orderStatus === 'delivered')
    : orders;

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter(o => o.orderStatus === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, icon: <FiPackage />, color: 'text-orange-500 bg-orange-50' },
    { label: "Today's Orders", value: todayOrders.length, icon: <FiClock />, color: 'text-blue-500 bg-blue-50' },
    { label: "Today's Revenue", value: formatPrice(todayRevenue), icon: <FiDollarSign />, color: 'text-green-500 bg-green-50' },
    { label: 'Menu Items', value: menuItems.length, icon: <FiList />, color: 'text-purple-500 bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {restaurant?.name || 'Restaurant Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {restaurant?.address?.city} · {restaurant?.isOpen ? '🟢 Open' : '🔴 Closed'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 border border-gray-200 px-3 py-2 rounded-lg hover:border-orange-300 transition"
          >
            <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[{ id: 'orders', label: 'Orders' }, { id: 'menu', label: 'Menu Items' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.id === 'orders' && activeOrders.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {[
                { id: 'active', label: `Active (${activeOrders.length})` },
                { id: 'completed', label: 'Completed' },
                { id: 'all', label: 'All Orders' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === f.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredOrders.map(order => (
                    <OrderCard key={order._id} order={order} onStatusUpdate={fetchData} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No orders here</h3>
                <p className="text-gray-500">New orders will appear here automatically</p>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">{menuItems.length} items · {menuItems.filter(i => i.isAvailable).length} available</p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : menuItems.length > 0 ? (
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_150.jpg'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        {item.isVegetarian && (
                          <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">Veg</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.category}</p>
                      <p className="font-bold text-orange-500 text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => handleToggleItem(item._id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        item.isAvailable
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {item.isAvailable ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No menu items yet</h3>
                <p className="text-gray-500">Add items to your menu to start receiving orders</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
