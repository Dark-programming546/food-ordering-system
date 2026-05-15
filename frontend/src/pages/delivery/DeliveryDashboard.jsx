import React, { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiCheckCircle, FiDollarSign, FiStar, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { orderService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import EarningsCard from '../../components/delivery/EarningsCard';
import OrderCard from '../../components/delivery/OrderCard';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const [data, setData] = useState({ assignedOrders: [], availableOrders: [], deliveryHistory: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await orderService.getDeliveryOrders();
      setData(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handlePickUp = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderService.updateDeliveryStatus(orderId, 'out-for-delivery');
      toast.success('Order picked up! Head to customer.');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderService.updateDeliveryStatus(orderId, 'delivered');
      toast.success('🎉 Order delivered successfully!');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const today = new Date().toDateString();
  const todayCompleted = data.deliveryHistory.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayEarnings = todayCompleted.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const count = data.deliveryHistory.filter(o => new Date(o.createdAt).toDateString() === dateStr).length;
    return { day: d.toLocaleDateString('en-ET', { weekday: 'short' }), count };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  const stats = [
    { label: 'Active Deliveries', value: data.assignedOrders.length, icon: <FiTruck />, color: 'text-orange-500 bg-orange-50' },
    { label: "Today's Completed", value: todayCompleted.length, icon: <FiCheckCircle />, color: 'text-green-500 bg-green-50', sub: '↑ Great work!' },
    { label: "Today's Earnings", value: formatPrice(todayEarnings), icon: <FiDollarSign />, color: 'text-blue-500 bg-blue-50' },
    { label: 'Total Deliveries', value: data.deliveryHistory.length, icon: <FiPackage />, color: 'text-purple-500 bg-purple-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 text-sm">Gozamen Restaurant · Delivery</p>
        </div>
        <button onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}
          className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:border-orange-300 text-gray-600 hover:text-orange-500 transition">
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <EarningsCard key={i} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiTruck className="text-orange-500" /> My Active Deliveries
            {data.assignedOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{data.assignedOrders.length}</span>
            )}
          </h2>
          {data.assignedOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-2">🛵</div>
              <p className="text-gray-500 text-sm">No active deliveries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.assignedOrders.map(order => (
                <OrderCard key={order._id} order={order}
                  onPickUp={handlePickUp} onDeliver={handleDeliver}
                  loading={actionLoading === order._id} />
              ))}
            </div>
          )}
        </div>

        {/* Available Orders */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiPackage className="text-purple-500" /> Available Orders
            {data.availableOrders?.length > 0 && (
              <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">{data.availableOrders.length}</span>
            )}
          </h2>
          {!data.availableOrders?.length ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-gray-500 text-sm">No available orders right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.availableOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-500">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{order.items?.length} item(s) · {Math.round((Date.now() - new Date(order.createdAt)) / 60000)} min ago</p>
                  <p className="text-xs text-gray-400 italic">Assigned by admin — check Active Deliveries</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Last 7 Days Deliveries</h2>
        <div className="flex items-end gap-3 h-32">
          {last7.map((d, i) => {
            const h = Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {d.count > 0 && <span className="text-xs font-bold text-gray-600">{d.count}</span>}
                <div className="w-full rounded-t-lg" style={{ height: `${h}%`, background: d.count > 0 ? 'linear-gradient(to top, #f97316, #fb923c)' : '#f3f4f6' }} />
                <span className="text-xs text-gray-400">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
