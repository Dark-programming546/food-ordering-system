import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { orderService } from '../../services/api';
import OrderCard from '../../components/delivery/OrderCard';
import toast from 'react-hot-toast';

export default function DeliveryActiveOrders() {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState('pickup');

  const fetchData = useCallback(async () => {
    try {
      const res = await orderService.getDeliveryOrders();
      setAssignedOrders(res.data.assignedOrders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePickUp = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderService.updateDeliveryStatus(orderId, 'out-for-delivery');
      toast.success('Picked up! Head to customer.');
      fetchData();
    } catch {
      toast.error('Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderService.updateDeliveryStatus(orderId, 'delivered');
      toast.success('🎉 Delivered successfully!');
      fetchData();
    } catch {
      toast.error('Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const readyOrders = assignedOrders.filter(o => o.orderStatus === 'ready');
  const inTransitOrders = assignedOrders.filter(o => o.orderStatus === 'out-for-delivery');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Active Orders</h1>
        <button onClick={fetchData}
          className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:border-orange-300 text-gray-600 hover:text-orange-500 transition">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'pickup', label: `Ready for Pickup (${readyOrders.length})` },
          { id: 'transit', label: `In Transit (${inTransitOrders.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ready for Pickup */}
      {tab === 'pickup' && (
        readyOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-500">No orders ready for pickup</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {readyOrders.map(order => (
              <OrderCard key={order._id} order={order}
                onPickUp={handlePickUp} loading={actionLoading === order._id} />
            ))}
          </div>
        )
      )}

      {/* In Transit */}
      {tab === 'transit' && (
        inTransitOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-5xl mb-3">🛵</div>
            <p className="text-gray-500">No orders in transit</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {inTransitOrders.map(order => (
              <OrderCard key={order._id} order={order}
                onDeliver={handleDeliver} loading={actionLoading === order._id} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
