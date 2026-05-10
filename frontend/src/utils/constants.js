export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: '✅' },
  preparing: { label: 'Preparing', color: 'bg-purple-500', icon: '👨‍🍳' },
  ready: { label: 'Ready', color: 'bg-green-500', icon: '📦' },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-orange-500', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-600', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: '❌' },
};

export const PAYMENT_METHODS = {
  cash: { label: 'Cash on Delivery', icon: '💵' },
  telebirr: { label: 'Telebirr', icon: '📱' },
  cbebirr: { label: 'CBEBirr', icon: '🏦' },
};

export const USER_ROLES = {
  customer: 'customer',
  restaurant: 'restaurant',
  delivery: 'delivery',
  admin: 'admin',
};