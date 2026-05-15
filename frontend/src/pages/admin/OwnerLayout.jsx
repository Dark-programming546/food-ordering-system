import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiList, FiTruck, FiUsers,
  FiBarChart2, FiSettings, FiLogOut, FiMenu
} from 'react-icons/fi';

import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminMenu from './AdminMenu';
import AdminDelivery from './AdminDelivery';
import AdminCustomers from './AdminCustomers';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: <FiGrid size={18} /> },
  { id: 'orders',    label: 'Orders',     icon: <FiShoppingBag size={18} /> },
  { id: 'menu',      label: 'Menu',       icon: <FiList size={18} /> },
  { id: 'delivery',  label: 'Delivery',   icon: <FiTruck size={18} /> },
  { id: 'customers', label: 'Customers',  icon: <FiUsers size={18} /> },
  { id: 'reports',   label: 'Reports',    icon: <FiBarChart2 size={18} /> },
  { id: 'settings',  label: 'Settings',   icon: <FiSettings size={18} /> },
];

const PAGES = {
  dashboard: <AdminDashboard />,
  orders:    <AdminOrders />,
  menu:      <AdminMenu />,
  delivery:  <AdminDelivery />,
  customers: <AdminCustomers />,
  reports:   <AdminReports />,
  settings:  <AdminSettings />,
};

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-lg shadow">
            🍽️
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">Gozamen</p>
            <p className="text-orange-400 text-xs">Owner Panel 👑</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-orange-400 text-xs">Restaurant Owner</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition">
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 shrink-0"><SidebarContent /></aside>
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-gray-900 flex flex-col z-10"><SidebarContent /></aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-orange-500">
              <FiMenu size={22} />
            </button>
            <div>
              <h2 className="font-bold text-gray-900 capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-xs text-gray-400 hidden sm:block">Gozamen Restaurant · Owner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name?.split(' ')[0]}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{PAGES[activeTab]}</main>
      </div>
    </div>
  );
}
