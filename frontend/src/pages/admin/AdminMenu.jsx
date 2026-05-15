import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiSave } from 'react-icons/fi';
import { menuService, adminService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CATEGORIES = ['Ethiopian', 'Breakfast', 'Lunch', 'Dinner', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack'];

const EMPTY_FORM = { name: '', description: '', price: '', category: '', preparationTime: '', isVegetarian: false, image: '' };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/restaurants');
      const r = res.data?.restaurants?.[0];
      if (!r) return;
      setRestaurantId(r._id);
      const menuRes = await menuService.getByRestaurant(r._id);
      const all = menuRes.data?.allItems || [];
      setItems(all);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, preparationTime: item.preparationTime || '', isVegetarian: item.isVegetarian || false, image: item.image || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Name, price and category are required'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await menuService.update(editItem._id, { ...form, price: parseFloat(form.price), preparationTime: parseInt(form.preparationTime) || 15 });
        toast.success('Item updated');
      } else {
        await menuService.add({ ...form, price: parseFloat(form.price), preparationTime: parseInt(form.preparationTime) || 15, restaurantId });
        toast.success('Item added');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    setDeletingId(id);
    try {
      await menuService.delete(id);
      toast.success('Item deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      await menuService.toggleAvailability(id);
      setItems(prev => prev.map(i => i._id === id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const categories = ['all', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm">{items.length} items · {items.filter(i => i.isAvailable).length} available</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition shadow-sm text-sm">
          <FiPlus size={16} /> Add New Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterCat === c ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}>
            {c === 'all' ? 'All Items' : c}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-gray-500 mb-4">No menu items yet</p>
          <button onClick={openAdd} className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">
            Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  {item.isVegetarian && <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Veg</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                  </span>
                </div>
                {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="font-bold text-orange-500 text-sm">{formatPrice(item.price)}</span>
                  <span>· {item.category}</span>
                  {item.preparationTime && <span>· {item.preparationTime} min</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(item._id)}
                  className={`p-2 rounded-lg transition ${item.isAvailable ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                  title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}>
                  {item.isAvailable ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(item)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                  {deletingId === item._id
                    ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <FiTrash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {[
                { label: 'Item Name *', key: 'name', type: 'text', placeholder: 'e.g. Doro Wat' },
                { label: 'Image URL', key: 'image', type: 'url', placeholder: 'https://...' },
                { label: 'Price (Br) *', key: 'price', type: 'number', placeholder: '0.00', step: '0.01' },
                { label: 'Preparation Time (min)', key: 'preparationTime', type: 'number', placeholder: '15' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} step={f.step}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Describe the dish..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVegetarian} onChange={e => setForm(p => ({ ...p, isVegetarian: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-700">Vegetarian item</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={14} />}
                  {editItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
