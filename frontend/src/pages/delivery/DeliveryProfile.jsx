import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiSave, FiEdit2, FiX, FiPackage, FiStar, FiDollarSign, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

export default function DeliveryProfile() {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, earnings: 0 });
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await orderService.getDeliveryOrders();
        const history = res.data.deliveryHistory || [];
        setStats({
          total: history.length,
          earnings: history.reduce((sum, o) => sum + (o.deliveryFee || 0), 0),
        });
      } catch { /* silent */ }
    };
    fetchStats();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(form);
    if (result.success) setEditMode(false);
    setSaving(false);
  };

  const perfStats = [
    { label: 'Total Deliveries', value: stats.total, icon: <FiPackage />, color: 'text-orange-500 bg-orange-50' },
    { label: 'Total Earnings', value: formatPrice(stats.earnings), icon: <FiDollarSign />, color: 'text-green-500 bg-green-50' },
    { label: 'Completion Rate', value: '100%', icon: <FiTruck />, color: 'text-blue-500 bg-blue-50' },
    { label: 'Rating', value: '4.8 ⭐', icon: <FiStar />, color: 'text-yellow-500 bg-yellow-50' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>

      {/* Avatar + Name */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-md">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            🚚 Delivery Partner
          </span>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4">
        {perfStats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Personal Information</h3>
          {!editMode ? (
            <button onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
              <FiEdit2 size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)}
                className="flex items-center gap-1 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <FiX size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1 text-sm text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={13} />}
                Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', icon: <FiUser size={14} />, type: 'text' },
            { label: 'Phone', key: 'phone', icon: <FiPhone size={14} />, type: 'tel' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                <span className="text-orange-400">{f.icon}</span> {f.label}
              </label>
              <input type={f.type} value={form[f.key]} readOnly={!editMode}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors ${
                  !editMode ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default' : 'border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white'
                }`} />
            </div>
          ))}

          {/* Email - always read only */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1.5">
              <span className="text-orange-400"><FiMail size={14} /></span> Email
            </label>
            <input type="email" value={user?.email || ''} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-default" />
          </div>
        </div>
      </div>
    </div>
  );
}
