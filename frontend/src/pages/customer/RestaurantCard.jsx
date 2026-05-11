import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiStar, FiTruck } from 'react-icons/fi';

const RestaurantCard = ({ restaurant }) => {
  // Get first cuisine type
  const mainCuisine = restaurant.cuisine?.[0] || 'Various';
  const otherCuisines = restaurant.cuisine?.slice(1).join(', ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/restaurant/${restaurant._id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={restaurant.images?.logo || 'https://via.placeholder.com/400x200?text=Restaurant'}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Rating Badge */}
            {restaurant.rating > 0 && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                <FiStar className="text-yellow-500 w-3 h-3 fill-yellow-500" />
                <span className="text-sm font-semibold">{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
            {/* Open Status */}
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold ${
              restaurant.isOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
              {restaurant.name}
            </h3>
            
            {/* Cuisine */}
            <p className="text-sm text-gray-500 mb-2">
              {mainCuisine}{otherCuisines && ` • ${otherCuisines}`}
            </p>
            
            {/* Details */}
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{restaurant.address?.city}, {restaurant.address?.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="w-3.5 h-3.5" />
                  <span>{restaurant.estimatedDeliveryTime} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiTruck className="w-3.5 h-3.5" />
                  <span>${restaurant.deliveryFee} delivery</span>
                </div>
              </div>
            </div>

            {/* Min Order */}
            {restaurant.minimumOrder > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Min. order: ${restaurant.minimumOrder}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;