import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';

const RestaurantCard = ({ restaurant, index }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/restaurant/${restaurant._id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={restaurant.images?.cover || defaultImage}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold flex items-center">
              <FiStar className="text-yellow-500 mr-1" />
              {restaurant.rating || 4.5}
            </div>
            {restaurant.isOpen ? (
              <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Open Now
              </div>
            ) : (
              <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Closed
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-orange-500 transition">
              {restaurant.name}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {restaurant.cuisine?.slice(0, 3).map((c, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>

            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex items-center">
                <FiMapPin className="mr-1 text-gray-400" size={14} />
                <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiClock className="mr-1 text-gray-400" size={14} />
                  <span>{restaurant.estimatedDeliveryTime} min</span>
                </div>
                <div className="flex items-center">
                  <FiDollarSign className="mr-1 text-gray-400" size={14} />
                  <span>${restaurant.deliveryFee} delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;