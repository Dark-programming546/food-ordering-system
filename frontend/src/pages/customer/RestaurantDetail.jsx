import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../services/restaurantService';
import { FiStar, FiMapPin, FiClock, FiDollarSign, FiPhone, FiMail, FiChevronLeft, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getById(id);
      setRestaurant(data.restaurant);
      
      // Group menu by category
      const groupedMenu = {};
      data.menu.forEach(item => {
        if (!groupedMenu[item.category]) {
          groupedMenu[item.category] = [];
        }
        groupedMenu[item.category].push(item);
      });
      setMenu(groupedMenu);
    } catch (error) {
      toast.error('Failed to load restaurant details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    const quantity = quantities[item._id] || 1;
    // Cart functionality will be added in Day 4
    toast.success(`Added ${quantity} x ${item.name} to cart`);
    setQuantities({ ...quantities, [item._id]: 1 });
  };

  const updateQuantity = (itemId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Restaurant not found</p>
      </div>
    );
  }

  const categories = ['all', ...Object.keys(menu)];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={restaurant.images?.cover || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <FiStar className="mr-1 text-yellow-400" />
              <span>{restaurant.rating || 4.5} ({restaurant.totalReviews || 0} reviews)</span>
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-1" />
              <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-1" />
              <span>{restaurant.estimatedDeliveryTime} min</span>
            </div>
            <div className="flex items-center">
              <FiDollarSign className="mr-1" />
              <span>${restaurant.deliveryFee} delivery</span>
            </div>
          </div>
          <p className="mt-3 text-white/90 max-w-2xl">{restaurant.description}</p>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 sticky top-0 bg-gray-50 z-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {Object.entries(menu).map(([category, items]) => {
          if (selectedCategory !== 'all' && selectedCategory !== category) return null;
          
          return (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="flex">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover"
                        />
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            {item.isVegetarian && (
                              <span className="inline-block text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full mt-2">
                                Vegetarian
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-500">${item.price}</div>
                            {!item.isAvailable && (
                              <span className="text-xs text-red-500">Unavailable</span>
                            )}
                          </div>
                        </div>

                        {item.isAvailable && (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item._id, -1)}
                                className="px-3 py-1 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 min-w-[40px] text-center">
                                {quantities[item._id] || 1}
                              </span>
                              <button
                                onClick={() => updateQuantity(item._id, 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="bg-orange-500 text-white px-4 py-1 rounded-lg hover:bg-orange-600 transition text-sm"
                            >
                              Add to Cart
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantDetail;