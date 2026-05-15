import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiRefreshCw, FiUser, FiEye } from 'react-icons/fi';
import { adminService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:            { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700' },
  confirmed:          { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700' },
  preparing:          { label: 'Preparing',         color: 'bg-orange-100 text-orange-700' },
  ready:              { label: 'Ready',             color: 'bg-purple-100 text-purple-700' },
  'out-for-delivery': { label: 'Out for Delivery',  color: 'bg-indigo-100 text-indigo-700' },
  delivered:          { label: 'Delivered',         color: 'bg-green-100 text-green-700' },
  cancelled:          { label: 'Cancelled',         color: 'bg-red-100 text-red-700' },
};

const FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];

export default function AdminAllOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await adminService.getAllOrders();
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.orderStatus === filter;
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">All Orders</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <FiEye size={13} /> Read-only oversight · {orders.length} total orders
          </p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:border-blue-300 text-gray-600 hover:text-blue-500 transition">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}>
              {f === 'all' ? `All (${orders.length})` : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const sc = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">#{order.orderNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.color}`}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <FiUser size={11} /> {order.customerName} · {order.customerPhone}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                    {/* Items summary */}
                    <p className="text-xs text-gray-400 mt-1">
                      {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.paymentMethod}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString('en-ET', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {order.deliveryPerson && (
                      <p className="text-xs text-indigo-500 mt-0.5">🚚 {order.deliveryPerson?.name}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
