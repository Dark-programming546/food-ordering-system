import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiPackage, FiDollarSign, FiClock, FiMapPin } from 'react-icons/fi';
import { orderService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import StatusBadge from '../../components/delivery/StatusBadge';
import toast from 'react-hot-toast';

const PERIODS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'All Time', days: 0 },
];

export default function DeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await orderService.getDeliveryOrders();
      setHistory(res.data.deliveryHistory || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = history.filter(o => {
    if (period === 0) return true;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - period);
    return new Date(o.createdAt) >= cutoff;
  });

  const totalEarnings = filtered.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const avgTime = 35; // placeholder — would need timeline data

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-gray-900">Delivery History</h1>

      {/* Period Filter */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button key={p.days} onClick={() => setPeriod(p.days)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === p.days ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Deliveries', value: filtered.length, icon: <FiPackage />, color: 'text-orange-500 bg-orange-50' },
          { label: 'Total Earnings', value: formatPrice(totalEarnings), icon: <FiDollarSign />, color: 'text-green-500 bg-green-50' },
          { label: 'Avg Delivery Time', value: `${avgTime} min`, icon: <FiClock />, color: 'text-blue-500 bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">No delivery history for this period</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <FiCalendar size={11} />
                    {new Date(order.createdAt).toLocaleDateString('en-ET', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.orderStatus} />
                  <p className="text-sm font-bold text-orange-500 mt-1">{formatPrice(order.deliveryFee || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FiMapPin size={11} /> {order.deliveryAddress?.city}
                </span>
                <span>{order.items?.length} item(s)</span>
                <span>Order: {formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
