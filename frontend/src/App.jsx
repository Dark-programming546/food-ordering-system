import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Pages
import Home from './pages/customer/Home';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Admin
import AdminLayout from './pages/admin/AdminLayout';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

// Admin uses its own full-screen layout (no Navbar)
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const ComingSoon = ({ title }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500">This page is under development.</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />

      {/* Customer */}
      <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />

      {/* Delivery */}
      <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery']}><ComingSoon title="Delivery Dashboard" /></ProtectedRoute>} />

      {/* Admin — full screen, no Navbar */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl font-extrabold text-gray-200 mb-4">404</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Page not found</h2>
            <a href="/" className="text-orange-500 hover:underline font-medium">← Back to Home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

// Wrapper that hides Navbar for admin routes
function AppShell() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdmin && <Navbar />}
      <main>
        <AppRoutes />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { background: '#1f2937', color: '#fff', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
