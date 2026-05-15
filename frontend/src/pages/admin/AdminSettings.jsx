import React, { useState, useEffect } from 'react';
import { FiSave, FiMapPin, FiDollarSign, FiClock, FiPhone, FiMail, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { ownerService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', cuisine: '',
    deliveryFee: '', minimumOrder: '', estimatedDeliveryTime: '',
    isOpen: true,
    address: { street: '', city: '', state: '', zipCode: '' },
    contact: { phone: '', email: '' },
    images: { logo: '', cover: '' },
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ownerService.getRestaurantSettings();
        const r = res.data.restaurant;
        setRestaurant(r);
        setForm({
          name: r.name || '',
          description: r.description || '',
          cuisine: Array.isArray(r.cuisine) ? r.cuisine.join(', ') : (r.cuisine || ''),
          deliveryFee: r.deliveryFee ?? '',
          minimumOrder: r.minimumOrder ?? '',
          estimatedDeliveryTime: r.estimatedDeliveryTime ?? '',
          isOpen: r.isOpen ?? true,
          address: { street: r.address?.street || '', city: r.address?.city || '', state: r.address?.state || '', zipCode: r.address?.zipCode || '' },
          contact: { phone: r.contact?.phone || '', email: r.contact?.email || '' },
          images: { logo: r.images?.logo || '', cover: r.images?.cover || '' },
        });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        cuisine: form.cuisine.split(',').map(c => c.trim()).filter(Boolean),
        deliveryFee: parseFloat(form.deliveryFee) || 0,
        minimumOrder: parseFloat(form.minimumOrder) || 0,
        estimatedDeliveryTime: parseInt(form.estimatedDeliveryTime) || 30,
      };
      await ownerService.updateRestaurantSettings(payload);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    const newVal = !form.isOpen;
    setForm(p => ({ ...p, isOpen: newVal }));
    try {
      await ownerService.updateRestaurantSettings({ isOpen: newVal });
      toast.success(`Restaurant is now ${newVal ? 'Open' : 'Closed'}`);
    } catch {
      setForm(p => ({ ...p, isOpen: !newVal }));
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Restaurant Settings</h1>
          <p className="text-gray-500 text-sm">Manage Gozamen Restaurant configuration</p>
        </div>
        {/* Open/Close Toggle */}
        <button onClick={toggleOpen}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            form.isOpen ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}>
          {form.isOpen ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
          {form.isOpen ? 'Restaurant Open' : 'Restaurant Closed'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-3">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Types (comma separated)</label>
              <input value={form.cuisine} onChange={e => setForm(p => ({ ...p, cuisine: e.target.value }))}
                placeholder="Ethiopian, Traditional, Vegetarian"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-3 flex items-center gap-2">
            <FiMapPin className="text-orange-500" /> Address
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Street', key: 'street', placeholder: 'Bole Road, Near Edna Mall' },
              { label: 'City', key: 'city', placeholder: 'Addis Ababa' },
              { label: 'State / Region', key: 'state', placeholder: 'Addis Ababa' },
              { label: 'ZIP Code', key: 'zipCode', placeholder: '1000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input value={form.address[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, address: { ...p.address, [f.key]: e.target.value } }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-3 flex items-center gap-2">
            <FiPhone className="text-orange-500" /> Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FiPhone size={12} /> Phone</label>
              <input value={form.contact.phone} onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))}
                placeholder="0911000000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FiMail size={12} /> Email</label>
              <input type="email" value={form.contact.email} onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, email: e.target.value } }))}
                placeholder="info@gozamen.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </div>

        {/* Pricing & Timing */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-3 flex items-center gap-2">
            <FiDollarSign className="text-orange-500" /> Pricing & Timing
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Delivery Fee (Br)', key: 'deliveryFee', placeholder: '30' },
              { label: 'Minimum Order (Br)', key: 'minimumOrder', placeholder: '100' },
              { label: 'Est. Delivery Time (min)', key: 'estimatedDeliveryTime', placeholder: '35' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="number" value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-3">Images (URL)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Logo URL', key: 'logo' },
              { label: 'Cover Photo URL', key: 'cover' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="url" value={form.images[f.key]} placeholder="https://..."
                  onChange={e => setForm(p => ({ ...p, images: { ...p.images, [f.key]: e.target.value } }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                {form.images[f.key] && (
                  <img src={form.images[f.key]} alt={f.label} className="mt-2 h-16 w-full object-cover rounded-lg border border-gray-100"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 shadow-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
