import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { restaurantService, menuService } from '../../services/api';
import { FiClock, FiMapPin, FiStar, FiTruck, FiChevronLeft, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    try {
      const response = await restaurantService.getById(id);
      if (response.data.success) {
        setRestaurant(response.data.restaurant);
        setMenu(response.data.menu || {});
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta)
    }));
  };

  const addToCart = async (item) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    if (!isCustomer) {
      toast.error('Only customers can order');
      return;
    }
    
    const quantity = quantities[item._id] || 1;
    if (quantity === 0) {
      toast.error('Please select quantity');
      return;
    }
    
    setAddingToCart(prev => ({ ...prev, [item._id]: true }));
    
    try {
      // Import cart service dynamically
      const { cartService } = await import('../../services/api');
      await cartService.addItem(item._id, quantity, '');
      toast.success(`${quantity}x ${item.name} added to cart`);
      setQuantities(prev => ({ ...prev, [item._id]: 0 }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [item._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant not found</h2>
          <button onClick={() => navigate('/')} className="text-orange-500">Go back home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="sticky top-16 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition"
          >
            <FiChevronLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={restaurant.images?.cover || 'https://via.placeholder.com/1200x400?text=Restaurant+Cover'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <FiStar className="text-yellow-400 fill-yellow-400" />
                <span>{restaurant.rating.toFixed(1)} ({restaurant.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiClock />
                <span>{restaurant.estimatedDeliveryTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiTruck />
                <span>${restaurant.deliveryFee} delivery</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiMapPin />
                <span>{restaurant.address?.city}</span>
              </div>
            </div>
            <p className="mt-3 text-white/90 line-clamp-2">{restaurant.description}</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.keys(menu).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available at the moment.</p>
          </div>
        ) : (
          Object.entries(menu).map(([category, items]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500 inline-block">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {items.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold text-orange-500">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.isVegetarian && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Veg</span>
                          )}
                        </div>
                      </div>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-end space-x-3 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          disabled={!quantities[item._id] || quantities[item._id] <= 0}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                        >
                          <FiMinus />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {quantities[item._id] || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={addingToCart[item._id] || !quantities[item._id]}
                        className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 flex items-center space-x-1"
                      >
                        {addingToCart[item._id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <FiShoppingCart />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;