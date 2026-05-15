import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiX, FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDelivery() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await adminService.getDeliveryStaff();
      setStaff(res.data.staff || []);
    } catch {
      toast.error('Failed to load delivery staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('All fields are required'); return;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast.error('Enter a valid 10-digit phone number'); return;
    }
    setSaving(true);
    try {
      await adminService.createDeliveryStaff(form);
      toast.success(`${form.name} added as delivery staff`);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await adminService.toggleDeliveryStatus(id, !isActive);
      toast.success(`Staff ${!isActive ? 'activated' : 'deactivated'}`);
      fetchStaff();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from delivery staff?`)) return;
    setDeletingId(id);
    try {
      await adminService.deleteDeliveryStaff(id);
      toast.success(`${name} removed`);
      fetchStaff();
    } catch {
      toast.error('Failed to remove staff');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Delivery Staff</h1>
          <p className="text-gray-500 text-sm">{staff.length} staff · {staff.filter(s => s.isActive).length} active</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition shadow-sm text-sm">
          <FiPlus size={16} /> Add Delivery Person
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">🚚</div>
          <p className="text-gray-500 mb-4">No delivery staff yet</p>
          <button onClick={() => setShowModal(true)}
            className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">
            Add First Delivery Person
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(s => (
            <div key={s._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {s.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiMail size={12} /> {s.email}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FiPhone size={12} /> {s.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleStatus(s._id, s.isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      s.isActive
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}>
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(s._id, s.name)} disabled={deletingId === s._id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                    {deletingId === s._id
                      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <FiTrash2 size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">Add Delivery Person</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', icon: <FiUser size={14} />, placeholder: 'Abebe Kebede' },
                { label: 'Email', key: 'email', type: 'email', icon: <FiMail size={14} />, placeholder: 'abebe@gozamen.com' },
                { label: 'Phone', key: 'phone', type: 'tel', icon: <FiPhone size={14} />, placeholder: '0912345678' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiLock size={14} /></span>
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiPlus size={14} />}
                  Add & Send Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
