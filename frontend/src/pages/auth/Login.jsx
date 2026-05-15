import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Background images (same as register page)
  const backgroundImages = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&auto=format',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1920&auto=format',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&auto=format',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&auto=format',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1920&auto=format',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&auto=format',
  ];

  // Rotate images every 5 seconds - NO FLASH
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      const role = result.user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (role === 'delivery') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - Crossfade without white flash */}
      <div className="absolute inset-0">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImage === index ? 1 : 0,
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          {/* Logo/Brand */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 drop-shadow-lg">🍽️</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">Welcome Back!</h2>
            <p className="mt-1 text-white/80 text-sm">Sign in to Gozamen Restaurant</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 text-white/60" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-white/60" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4 text-white/60 hover:text-white transition" />
                    ) : (
                      <FiEye className="h-4 w-4 text-white/60 hover:text-white transition" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-orange-400 hover:text-orange-300 transition">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiLogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Image Counter Dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`transition-all duration-300 ${
                  currentImage === index
                    ? 'w-6 h-1.5 bg-white rounded-full'
                    : 'w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;