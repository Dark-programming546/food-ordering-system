import React, { useState, useEffect } from 'react';
import { FiPackage, FiDollarSign, FiUsers, FiTruck, FiRefreshCw, FiArrowUp } from 'react-icons/fi';
import { adminService, ownerService, orderService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-purple-100 text-purple-700',
  'out-for-delivery': 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const svc = user?.role === 'owner' ? ownerService : adminService;
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesByDate, setSalesByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOwner = user?.role === 'owner';

  const fetchData = async () => {
    try {
      const [dashRes, salesRes] = await Promise.all([
        svc.getDashboard(),
        svc.getSalesReport(),
      ]);
      setStats(dashRes.data.stats);
      setRecentOrders(dashRes.data.recentOrders || []);
      setSalesByDate((salesRes.data.report?.salesByDate || []).slice(-7));
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleAdvance = async (orderId, nextStatus) => {
    try {
      await orderService.updateStatus(orderId, nextStatus);
      fetchData();
    } catch { /* silent */ }
  };

  const maxSales = Math.max(...salesByDate.map(d => d.amount), 1);

  const statCards = [
    { label: 'Total Orders', value: stats?.orders?.total ?? 0, icon: <FiPackage />, color: 'text-orange-500 bg-orange-50', trend: '+12%' },
    { label: 'Total Revenue', value: formatPrice(stats?.revenue?.total ?? 0), icon: <FiDollarSign />, color: 'text-green-500 bg-green-50', trend: '+8%' },
    { label: 'Customers', value: stats?.users?.customers ?? 0, icon: <FiUsers />, color: 'text-blue-500 bg-blue-50', trend: '+5%' },
    { label: 'Delivery Staff', value: stats?.users?.delivery ?? 0, icon: <FiTruck />, color: 'text-purple-500 bg-purple-50', trend: '+20%' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isOwner ? 'Welcome back, Restaurant Manager 👑' : 'System overview · IT Admin 🛡️'}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:border-orange-300 text-gray-600 hover:text-orange-500 transition">
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                <FiArrowUp size={11} />{s.trend}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <span className="text-xs text-gray-400">{recentOrders.length} orders</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No orders yet</div>
            ) : recentOrders.map(order => {
              const next = NEXT_STATUS[order.orderStatus];
              return (
                <div key={order._id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{order.customerName} · {formatPrice(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                    {/* Only owner can advance order status */}
                    {isOwner && next && (
                      <button onClick={() => handleAdvance(order._id, next)}
                        className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-lg hover:bg-orange-600 transition capitalize">
                        → {next}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Sales (Last 7 Days)</h2>
          {salesByDate.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No sales data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {salesByDate.map((d, i) => {
                const height = Math.max((d.amount / maxSales) * 100, 4);
                const day = new Date(d.date).toLocaleDateString('en-ET', { weekday: 'short' });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{formatPrice(d.amount)}</span>
                    <div className="w-full bg-orange-100 rounded-t-lg relative group" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg" />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition">
                        {d.count} orders
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Orders', value: stats?.orders?.pending ?? 0, color: 'border-l-yellow-400' },
          { label: 'Completed Today', value: stats?.orders?.completed ?? 0, color: 'border-l-green-400' },
          { label: 'Active Restaurants', value: stats?.restaurants?.total ?? 1, color: 'border-l-orange-400' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 border-l-4 ${s.color}`}>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
