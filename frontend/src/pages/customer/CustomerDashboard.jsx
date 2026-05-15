import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import {
  FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck,
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700',  icon: <FiClock size={13} /> },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700',     icon: <FiCheckCircle size={13} /> },
  preparing:        { label: 'Preparing',         color: 'bg-orange-100 text-orange-700', icon: <FiPackage size={13} /> },
  ready:            { label: 'Ready',             color: 'bg-purple-100 text-purple-700', icon: <FiCheckCircle size={13} /> },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-700', icon: <FiTruck size={13} /> },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-700',   icon: <FiCheckCircle size={13} /> },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-700',       icon: <FiXCircle size={13} /> },
};

const OrderCard = ({ order }) => {
  const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">#{order.orderNumber}</p>
          <p className="text-sm text-gray-500">{order.restaurantName}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        {order.items?.slice(0, 2).map((item, i) => (
          <span key={i}>{item.name} x{item.quantity}{i < Math.min(order.items.length, 2) - 1 ? ', ' : ''}</span>
        ))}
        {order.items?.length > 2 && <span className="text-gray-400"> +{order.items.length - 2} more</span>}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="font-bold text-orange-500">{formatPrice(order.totalAmount)}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-ET', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <Link
          to={`/order-confirmation/${order._id}`}
          className="text-sm text-orange-500 hover:text-orange-600 font-semibold hover:underline"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  );
};

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
    }
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getCustomerOrders();
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const result = await updateProfile(profileData);
    if (result.success) setEditMode(false);
    setSaving(false);
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <FiPackage />, color: 'text-orange-500 bg-orange-50' },
    { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'delivered').length, icon: <FiCheckCircle />, color: 'text-green-500 bg-green-50' },
    { label: 'Active', value: orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus)).length, icon: <FiTruck />, color: 'text-blue-500 bg-blue-50' },
    { label: 'Cancelled', value: orders.filter(o => o.orderStatus === 'cancelled').length, icon: <FiXCircle />, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[{ id: 'orders', label: 'My Orders' }, { id: 'profile', label: 'Profile' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {['all', 'pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {f === 'all' ? 'All Orders' : STATUS_CONFIG[f]?.label || f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map(order => <OrderCard key={order._id} order={order} />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  {filter === 'all' ? 'No orders yet' : `No ${STATUS_CONFIG[filter]?.label} orders`}
                </h3>
                <p className="text-gray-500 mb-5">Start ordering from your favorite restaurants!</p>
                <Link to="/" className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition">
                  Browse Restaurants
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-semibold"
                >
                  <FiEdit2 size={14} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    <FiX size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-1 text-sm text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={14} />}
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', icon: <FiUser />, field: 'name', value: profileData.name, type: 'text' },
                { label: 'Email', icon: <FiMail />, field: 'email', value: user?.email, type: 'email', readOnly: true },
                { label: 'Phone', icon: <FiPhone />, field: 'phone', value: profileData.phone, type: 'tel' },
              ].map(({ label, icon, field, value, type, readOnly }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <span className="text-orange-400">{icon}</span> {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    readOnly={readOnly || !editMode}
                    onChange={(e) => !readOnly && setProfileData({ ...profileData, [field]: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                      readOnly || !editMode
                        ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default'
                        : 'border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white'
                    }`}
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <span className="text-orange-400"><FiMapPin /></span> Default Delivery Address
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'street', placeholder: 'Street address', span: 'col-span-3' },
                    { key: 'city', placeholder: 'City', span: '' },
                    { key: 'state', placeholder: 'State/Region', span: '' },
                  ].map(({ key, placeholder, span }) => (
                    <input
                      key={key}
                      type="text"
                      value={profileData.address[key]}
                      readOnly={!editMode}
                      placeholder={placeholder}
                      onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, [key]: e.target.value } })}
                      className={`px-3 py-2.5 border rounded-lg text-sm ${span} transition-colors ${
                        !editMode
                          ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default'
                          : 'border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-ET', { month: 'long', year: 'numeric' })}
                {' · '}Role: <span className="capitalize font-medium text-gray-500">{user?.role}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
