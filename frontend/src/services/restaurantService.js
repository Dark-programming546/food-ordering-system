import api from './api';

export const restaurantService = {
  // Get all restaurants
  getAll: async (params = {}) => {
    const response = await api.get('/restaurants', { params });
    return response.data;
  },

  // Get single restaurant with menu
  getById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Search restaurants
  search: async (query) => {
    const response = await api.get('/restaurants', { params: { search: query } });
    return response.data;
  },

  // Filter by cuisine
  filterByCuisine: async (cuisine) => {
    const response = await api.get('/restaurants', { params: { cuisine } });
    return response.data;
  },

  // Filter by city
  filterByCity: async (city) => {
    const response = await api.get('/restaurants', { params: { city } });
    return response.data;
  },
};