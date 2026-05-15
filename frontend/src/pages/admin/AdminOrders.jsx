import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiRefreshCw, FiCheckCircle, FiX, FiTruck, FiUser } from 'react-icons/fi';
import { orderService, adminService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:            { label: 'Pending',           color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed:          { label: 'Confirmed',          color: 'bg-blue-100 text-blue-700 border-blue-200' },
  preparing:          { label: 'Preparing',          color: 'bg-orange-100 text-orange-700 border-orange-200' },
  ready:              { label: 'Ready',              color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'out-for-delivery': { label: 'Out for Delivery',   color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  delivered:          { label: 'Delivered',          color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:          { label: 'Cancelled',          color: 'bg-red-100 text-red-700 border-red-200' },
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
};

const FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, staffRes] = await Promise.all([
        adminService.getAllOrders(),
        adminService.getDeliveryStaff(),
      ]);
      setOrders(ordersRes.data.orders || []);
      setDeliveryStaff(staffRes.data.staff || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdvance = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, nextStatus);
      toast.success(`Order marked as ${STATUS_CONFIG[nextStatus].label}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, 'cancelled');
      toast.success('Order cancelled');
      fetchData();
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignDelivery = async (orderId) => {
    const deliveryPersonId = selectedDelivery[orderId];
    if (!deliveryPersonId) { toast.error('Select a delivery person first'); return; }
    setAssigningId(orderId);
    try {
      await orderService.assignDelivery(orderId, deliveryPersonId);
      toast.success('Delivery person assigned');
      fetchData();
    } catch {
      toast.error('Failed to assign delivery');
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.orderStatus === filter;
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:border-orange-300 text-gray-600 hover:text-orange-500 transition">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order # or customer name..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}>
              {f === 'all' ? `All (${orders.length})` : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const next = NEXT_STATUS[order.orderStatus];
            const sc = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
            const isUpdating = updatingId === order._id;
            const isAssigning = assigningId === order._id;

            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <FiUser size={12} /> {order.customerName} · {order.customerPhone}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.paymentMethod}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-ET', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                      <span className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Advance status */}
                  {next && (
                    <button onClick={() => handleAdvance(order._id, next)} disabled={isUpdating}
                      className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition disabled:opacity-50">
                      {isUpdating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheckCircle size={12} />}
                      Mark as {STATUS_CONFIG[next]?.label}
                    </button>
                  )}

                  {/* Assign delivery when ready */}
                  {order.orderStatus === 'ready' && !order.deliveryPerson && (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDelivery[order._id] || ''}
                        onChange={e => setSelectedDelivery(prev => ({ ...prev, [order._id]: e.target.value }))}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="">Select delivery person</option>
                        {deliveryStaff.filter(s => s.isActive).map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                      <button onClick={() => handleAssignDelivery(order._id)} disabled={isAssigning}
                        className="flex items-center gap-1.5 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-600 transition disabled:opacity-50">
                        {isAssigning ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiTruck size={12} />}
                        Assign
                      </button>
                    </div>
                  )}

                  {/* Show assigned delivery person */}
                  {order.deliveryPerson && (
                    <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      <FiTruck size={11} /> {order.deliveryPerson?.name || 'Assigned'}
                    </span>
                  )}

                  {/* Cancel */}
                  {['pending', 'confirmed'].includes(order.orderStatus) && (
                    <button onClick={() => handleCancel(order._id)} disabled={isUpdating}
                      className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50 ml-auto">
                      <FiX size={12} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
