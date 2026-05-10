import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token, user, requiresEmailVerification } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
      }
      
      if (requiresEmailVerification) {
        toast.success('Registration successful! Please verify your email.');
      } else {
        toast.success('Registration successful!');
      }
      
      return { 
        success: true, 
        user, 
        requiresEmailVerification: requiresEmailVerification || false 
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await authService.verifyEmail(email, code);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      toast.success('Email verified successfully!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resendVerification = async (email) => {
    try {
      await authService.resendVerification(email);
      toast.success('Verification email resent. Please check your inbox.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    token,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isRestaurant: user?.role === 'restaurant',
    isDelivery: user?.role === 'delivery',
    isAdmin: user?.role === 'admin',
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};