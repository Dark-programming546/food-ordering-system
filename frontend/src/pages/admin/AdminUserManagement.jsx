import React, { useState, useEffect, useCallback } from 'react';
import {
  FiSearch, FiMail, FiPhone, FiCalendar, FiTrash2,
  FiEdit2, FiUserPlus, FiX, FiShield, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['customer', 'delivery', 'owner', 'admin'];

const ROLE_BADGE = {
  customer:  'bg-blue-100 text-blue-700',
  delivery:  'bg-purple-100 text-purple-700',
  owner:     'bg-orange-100 text-orange-700',
  admin:     'bg-red-100 text-red-700',
};

export default function AdminUserManagement() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser]   = useState(null); // { _id, role }
  const [deleting, setDeleting]   = useState(null);
  const [toggling, setToggling]   = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminService.getUsers(params);
      setUsers(res.data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    setToggling(user._id);
    try {
      await adminService.toggleUserStatus(user._id, !user.isActive);
      toast.success(`${user.name} ${!user.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  const handleChangeRole = async () => {
    if (!editUser) return;
    try {
      await adminService.updateUserRole(editUser._id, editUser.role);
      toast.success('Role updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setDeleting(user._id);
    try {
      await adminService.deleteUser(user._id);
      toast.success(`${user.name} deleted`);
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm">{users.length} users · Full control</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
        </div>
        <div className="flex gap-2">
          {['all', ...ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {u.isEmailVerified && (
                        <span className="text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiMail size={11} /> {u.email}
                      <span className="mx-1">·</span>
                      <FiPhone size={11} /> {u.phone}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FiCalendar size={11} />
                      Joined {new Date(u.createdAt).toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle active */}
                  <button onClick={() => handleToggleStatus(u)} disabled={toggling === u._id}
                    title={u.isActive ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition ${u.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {toggling === u._id
                      ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : u.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                  </button>

                  {/* Change role */}
                  <button onClick={() => setEditUser({ _id: u._id, name: u.name, role: u.role })}
                    title="Change role"
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                    <FiShield size={16} />
                  </button>

                  {/* Delete — protect admin accounts */}
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u)} disabled={deleting === u._id}
                      title="Delete user"
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                      {deleting === u._id
                        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <FiTrash2 size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Role Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Change Role</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Changing role for <span className="font-semibold text-gray-800">{editUser.name}</span></p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {ROLES.map(r => (
                <button key={r} onClick={() => setEditUser(p => ({ ...p, role: r }))}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition ${
                    editUser.role === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleChangeRole}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
