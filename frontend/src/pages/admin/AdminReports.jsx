import React, { useState, useEffect } from 'react';
import { FiDownload, FiCalendar, FiTrendingUp, FiDollarSign, FiPackage, FiStar } from 'react-icons/fi';
import { ownerService, adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const PAYMENT_COLORS = { telebirr: 'bg-blue-500', cash: 'bg-green-500', cbebirr: 'bg-purple-500', card: 'bg-orange-500' };

export default function AdminReports() {
  const { user } = useAuth();
  const svc = user?.role === 'owner' ? ownerService : adminService;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await svc.getSalesReport({ startDate, endDate });
      setReport(res.data.report);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  // Compute top items from orders
  const topItems = React.useMemo(() => {
    if (!report?.orders) return [];
    const counts = {};
    report.orders.forEach(o => {
      o.items?.forEach(item => {
        if (!counts[item.name]) counts[item.name] = { name: item.name, count: 0, revenue: 0 };
        counts[item.name].count += item.quantity;
        counts[item.name].revenue += item.price * item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [report]);

  // Payment breakdown
  const paymentBreakdown = React.useMemo(() => {
    if (!report?.orders) return [];
    const totals = {};
    report.orders.forEach(o => {
      const m = o.paymentMethod || 'cash';
      if (!totals[m]) totals[m] = { method: m, count: 0, amount: 0 };
      totals[m].count++;
      totals[m].amount += o.totalAmount;
    });
    const total = Object.values(totals).reduce((s, t) => s + t.amount, 0);
    return Object.values(totals).map(t => ({ ...t, pct: total > 0 ? Math.round((t.amount / total) * 100) : 0 }));
  }, [report]);

  const exportCSV = () => {
    if (!report?.orders?.length) { toast.error('No data to export'); return; }
    const rows = [['Date', 'Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status']];
    report.orders.forEach(o => {
      rows.push([
        new Date(o.createdAt).toLocaleDateString(),
        o.orderNumber,
        o.customerName,
        o.items?.map(i => `${i.name}x${i.quantity}`).join('; '),
        o.totalAmount?.toFixed(2),
        o.paymentMethod,
        o.orderStatus,
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `gozamen-report-${startDate}-${endDate}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Sales performance overview</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-600 transition text-sm">
          <FiDownload size={16} /> Export CSV
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <FiCalendar className="text-orange-500" size={18} />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <button onClick={fetchReport}
          className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition">
          Apply
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: report?.totalOrders ?? 0, icon: <FiPackage />, color: 'text-orange-500 bg-orange-50' },
              { label: 'Total Revenue', value: formatPrice(report?.totalSales ?? 0), icon: <FiDollarSign />, color: 'text-green-500 bg-green-50' },
              { label: 'Avg Order Value', value: formatPrice(report?.averageOrderValue ?? 0), icon: <FiTrendingUp />, color: 'text-blue-500 bg-blue-50' },
              { label: 'Top Item', value: topItems[0]?.name || 'N/A', icon: <FiStar />, color: 'text-yellow-500 bg-yellow-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-extrabold text-gray-900 truncate">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Selling Items */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Top Selling Items</h2>
              </div>
              <div className="p-5 space-y-3">
                {topItems.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No data available</p>
                ) : topItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{item.count} orders</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Payment Method Breakdown</h2>
              </div>
              <div className="p-5 space-y-4">
                {paymentBreakdown.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No data available</p>
                ) : paymentBreakdown.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{p.method}</span>
                      <span className="text-gray-500">{p.pct}% · {formatPrice(p.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${PAYMENT_COLORS[p.method] || 'bg-gray-400'}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Sales Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Daily Sales</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Orders', 'Revenue'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report?.salesByDate || []).length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No sales data for this period</td></tr>
                  ) : (report?.salesByDate || []).map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-700">{new Date(d.date).toLocaleDateString('en-ET', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{d.count}</td>
                      <td className="px-5 py-3 font-bold text-orange-500">{formatPrice(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
