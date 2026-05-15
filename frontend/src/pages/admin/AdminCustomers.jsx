import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiMail, FiPhone, FiCalendar, FiPackage } from 'react-icons/fi';
import { adminService } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await adminService.getUsers({ role: 'customer' });
      setCustomers(res.data.users || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">{customers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-500">{search ? 'No customers match your search' : 'No customers yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {c.isEmailVerified && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiMail size={12} /> {c.email}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FiPhone size={12} /> {c.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p className="flex items-center gap-1 justify-end">
                    <FiCalendar size={12} />
                    Joined {new Date(c.createdAt).toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {c.address?.city && (
                    <p className="text-xs text-gray-400 mt-0.5">{c.address.city}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
