import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX,
  FiHome, FiPackage, FiSettings, FiChevronDown, FiTruck
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isRestaurant, isDelivery } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isRestaurant) return '/restaurant/dashboard';
    if (isDelivery) return '/delivery/dashboard';
    return '/customer/dashboard';
  };

  const isCustomer = !isAdmin && !isRestaurant && !isDelivery;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-orange-200 transition-shadow">
              <span className="text-lg">🍕</span>
            </div>
            <span className="font-extrabold text-xl text-gray-900">
              Food<span className="text-orange-500">Order</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.includes('dashboard') ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && isCustomer && (
              <Link
                to="/customer/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/customer/orders') ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                My Orders
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Cart - customers only */}
                {isCustomer && (
                  <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                    <FiShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-bounce">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                    <FiChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUser size={14} /> Profile
                      </Link>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiSettings size={14} /> Dashboard
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-sm hover:shadow-orange-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && isCustomer && (
              <Link to="/cart" className="relative p-2 text-gray-600">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 font-medium">
              <FiHome size={16} /> Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 font-medium">
                  <FiSettings size={16} /> Dashboard
                </Link>
                {isCustomer && (
                  <Link to="/customer/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 font-medium">
                    <FiPackage size={16} /> My Orders
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 font-medium">
                  <FiUser size={16} /> Profile
                </Link>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="px-3 py-2 text-center rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-orange-300">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 text-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
