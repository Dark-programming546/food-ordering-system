import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import RestaurantDetail from './pages/customer/RestaurantDetail';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Pages
import Home from './pages/customer/Home';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Placeholder for other pages
const ComingSoon = ({ title }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      
      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ComingSoon title="Customer Dashboard" />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ComingSoon title="Shopping Cart" />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ComingSoon title="Checkout" />
        </ProtectedRoute>
      } />
      <Route path="/customer/orders" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ComingSoon title="Order History" />
        </ProtectedRoute>
      } />
      
      {/* Restaurant Routes */}
      <Route path="/restaurant/dashboard" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <ComingSoon title="Restaurant Dashboard" />
        </ProtectedRoute>
      } />
      
      {/* Delivery Routes */}
      <Route path="/delivery/dashboard" element={
        <ProtectedRoute allowedRoles={['delivery']}>
          <ComingSoon title="Delivery Dashboard" />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ComingSoon title="Admin Dashboard" />
        </ProtectedRoute>
      } />
      
      {/* Profile */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ComingSoon title="Profile" />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <AppRoutes />
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;