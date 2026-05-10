import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/common/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Pages
import Home from './pages/customer/Home';

// Temporary placeholder for other pages
const ComingSoon = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Coming Soon</h1>
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </div>
);

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

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders/:id" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/track/:orderNumber" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        
        {/* Restaurant Routes */}
        <Route path="/restaurant/dashboard" element={
          <ProtectedRoute allowedRoles={['restaurant']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/restaurant/orders" element={
          <ProtectedRoute allowedRoles={['restaurant']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/restaurant/menu" element={
          <ProtectedRoute allowedRoles={['restaurant']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/restaurant/profile" element={
          <ProtectedRoute allowedRoles={['restaurant']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/restaurant/reports" element={
          <ProtectedRoute allowedRoles={['restaurant']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        
        {/* Delivery Routes */}
        <Route path="/delivery/dashboard" element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/delivery/available" element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/delivery/my-orders" element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/delivery/history" element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/admin/restaurants" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ComingSoon />
          </ProtectedRoute>
        } />
        
        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ComingSoon />
          </ProtectedRoute>
        } />
        
        {/* 404 Not Found */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </AnimatePresence>
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