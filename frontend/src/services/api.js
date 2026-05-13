import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You don\'t have permission to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later');
    }
    // ✅ REMOVE THE ELSE BLOCK THAT SHOWS TOAST FOR OTHER ERRORS
    // else {
    //   toast.error(message);
    // }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyEmail: (email, code) => api.post('/auth/verify-email', { email, code }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout'),
};

// Restaurant Services
export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  getMyRestaurant: () => api.get('/restaurants/my-restaurant/profile'),
};

// Menu Services
export const menuService = {
  getByRestaurant: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}`),
  add: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/toggle`),
};

// Cart Services
export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (menuItemId, quantity, specialInstructions = '') => 
    api.post('/cart/add', { menuItemId, quantity, specialInstructions }),
  updateQuantity: (menuItemId, quantity) => 
    api.put(`/cart/update/${menuItemId}`, { quantity }),
  removeItem: (menuItemId) => api.delete(`/cart/remove/${menuItemId}`),
  clearCart: () => api.delete('/cart/clear'),
  getSummary: () => api.get('/cart/summary'),
};

// Order Services
export const orderService = {
  create: (data) => {
    console.log('📦 Order Service - Sending to backend:', data);
    return api.post('/orders/create', data);
  },
  getCustomerOrders: () => api.get('/orders/customer'),
  getRestaurantOrders: (params) => api.get('/orders/restaurant', { params }),
  getDeliveryOrders: () => api.get('/orders/delivery'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  assignDelivery: (id, deliveryPersonId) => api.put(`/orders/${id}/assign-delivery`, { deliveryPersonId }),
  updateDeliveryStatus: (id, status, note) => api.put(`/orders/${id}/delivery-status`, { status, note }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
};

// Payment Services
export const paymentService = {
  initiate: (orderId, paymentMethod, phoneNumber = null) => 
    api.post('/payments/initiate', { orderId, paymentMethod, phoneNumber }),
  getHistory: () => api.get('/payments/history'),
  verify: (paymentId) => api.get(`/payments/verify/${paymentId}`),
  getDetails: (paymentId) => api.get(`/payments/${paymentId}`),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getRestaurants: (params) => api.get('/admin/restaurants', { params }),
  approveRestaurant: (id) => api.put(`/admin/restaurants/${id}/approve`),
  blockRestaurant: (id, isActive) => api.put(`/admin/restaurants/${id}/block`, { isActive }),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getSalesReport: (params) => api.get('/admin/reports/sales', { params }),
};

// OTP Services
export const otpService = {
  send: (email, purpose = 'registration') => api.post('/otp/send', { email, purpose }),
  verify: (email, code, purpose = 'registration') => api.post('/otp/verify', { email, code, purpose }),
  resend: (email, purpose = 'registration') => api.post('/otp/resend', { email, purpose }),
};

export default api;