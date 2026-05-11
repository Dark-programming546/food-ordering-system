import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../services/api';
import { FiArrowRight, FiStar, FiClock, FiMapPin, FiTruck, FiShield, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories (keep as is - static)
  const categories = [
    { name: "Pizza", icon: "🍕", color: "bg-orange-100", count: 150 },
    { name: "Burgers", icon: "🍔", color: "bg-yellow-100", count: 120 },
    { name: "Sushi", icon: "🍣", color: "bg-red-100", count: 80 },
    { name: "Indian", icon: "🍛", color: "bg-orange-100", count: 100 },
    { name: "Chinese", icon: "🥡", color: "bg-red-100", count: 130 },
    { name: "Italian", icon: "🍝", color: "bg-green-100", count: 110 },
    { name: "Mexican", icon: "🌮", color: "bg-yellow-100", count: 70 },
    { name: "Desserts", icon: "🍰", color: "bg-pink-100", count: 90 },
  ];

  const features = [
    {
      icon: <FiTruck className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Get your food delivered in 30-40 minutes"
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Telebirr, CBEBirr, and Cash on Delivery"
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: "Best Quality",
      description: "Only the best restaurants and chefs"
    },
    {
      icon: <FiCreditCard className="w-8 h-8" />,
      title: "Best Prices",
      description: "Competitive prices and daily deals"
    }
  ];

  const heroSlides = [
    {
      title: "Craving Something Delicious?",
      subtitle: "Order from the best restaurants in your city",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format",
      cta: "Order Now"
    },
    {
      title: "Fresh Food, Fast Delivery",
      subtitle: "Hot meals delivered right to your doorstep",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1600&auto=format",
      cta: "Explore Menu"
    },
    {
      title: "Special Discounts Every Day",
      subtitle: "Save up to 50% on your favorite dishes",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format",
      cta: "View Deals"
    }
  ];

  // Sample fallback data (your original restaurants - KEEP AS BACKUP)
  const sampleRestaurants = [
    {
      id: 1,
      name: "Pizza Palace",
      cuisine: "Italian • Pizza • Pasta",
      rating: 4.8,
      deliveryTime: "25-35 min",
      deliveryFee: 3.99,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format",
      promo: "20% OFF on first order"
    },
    {
      id: 2,
      name: "Burger House",
      cuisine: "American • Burgers • Fast Food",
      rating: 4.6,
      deliveryTime: "20-30 min",
      deliveryFee: 2.99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format",
      promo: "Free Fries with any burger"
    },
    {
      id: 3,
      name: "Sushi Master",
      cuisine: "Japanese • Sushi • Asian",
      rating: 4.9,
      deliveryTime: "35-45 min",
      deliveryFee: 4.99,
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format",
      promo: "Buy 1 Get 1 Free on Rolls"
    },
    {
      id: 4,
      name: "Spice Garden",
      cuisine: "Indian • Curry • Biryani",
      rating: 4.7,
      deliveryTime: "30-40 min",
      deliveryFee: 3.49,
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format",
      promo: "Free Drink on orders $25+"
    },
    {
      id: 5,
      name: "Noodle House",
      cuisine: "Chinese • Noodles • Dim Sum",
      rating: 4.5,
      deliveryTime: "25-35 min",
      deliveryFee: 2.99,
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format",
      promo: "Combo Meal Starting at $12.99"
    },
    {
      id: 6,
      name: "Mediterranean Grill",
      cuisine: "Mediterranean • Greek • Healthy",
      rating: 4.8,
      deliveryTime: "30-40 min",
      deliveryFee: 3.99,
      image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&auto=format",
      promo: "Free Pita Bread"
    }
  ];

  // Fetch real restaurants from backend
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      console.log('Fetching restaurants from API...');
      const response = await restaurantService.getAll();
      console.log('API Response:', response.data);
      
      if (response.data.success && response.data.restaurants && response.data.restaurants.length > 0) {
        // Transform backend data to match your frontend format
        const formattedRestaurants = response.data.restaurants.map(rest => ({
          id: rest._id,
          name: rest.name,
          cuisine: rest.cuisine?.join(' • ') || 'Various',
          rating: rest.rating || 4.5,
          deliveryTime: `${rest.estimatedDeliveryTime || 30}-${(rest.estimatedDeliveryTime || 30) + 10} min`,
          deliveryFee: rest.deliveryFee || 2.99,
          image: rest.images?.logo || rest.images?.cover || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format',
          promo: rest.isOpen ? 'Open Now' : 'Closed',
          isOpen: rest.isOpen
        }));
        setFeaturedRestaurants(formattedRestaurants);
        console.log('Restaurants loaded from API:', formattedRestaurants.length);
      } else {
        // If no restaurants in API, use sample data
        console.log('No restaurants in API, using sample data');
        setFeaturedRestaurants(sampleRestaurants);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants. Using sample data.');
      // Fallback to sample data if API fails
      setFeaturedRestaurants(sampleRestaurants);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // If no restaurants at all, use sample data
  const displayRestaurants = featuredRestaurants.length > 0 ? featuredRestaurants : sampleRestaurants;

  return (
    <div className="overflow-x-hidden">
      {/* Hero Slider Section - KEEP AS IS */}
      <section className="relative h-[600px] md:h-[700px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          loop={true}
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <div className="relative h-full flex items-center justify-center text-center">
                  <div className="px-4 max-w-4xl">
                    <motion.h1 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg md:text-xl text-white/90 mb-8"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Link
                        to={isAuthenticated ? "/restaurants" : "/register"}
                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                      >
                        Get Started
                        <FiArrowRight className="ml-2" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Features Section - KEEP AS IS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FoodOrder?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the best food delivery service in Ethiopia
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section - KEEP AS IS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Discover your favorite cuisine
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="text-center cursor-pointer"
              >
                <div className={`w-20 h-20 mx-auto ${category.color} rounded-full flex items-center justify-center text-3xl mb-2 shadow-md hover:shadow-lg transition-all`}>
                  {category.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{category.name}</p>
                <p className="text-xs text-gray-500">{category.count}+ items</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Restaurants - MODIFIED to use real data */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Restaurants
              </h2>
              <p className="text-lg text-gray-600">
                Hand-picked just for you
              </p>
            </div>
            <Link to="/restaurants" className="text-orange-500 hover:text-orange-600 font-semibold flex items-center">
              View All
              <FiArrowRight className="ml-1" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-t-xl"></div>
                  <div className="p-4 bg-white rounded-b-xl">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id || index}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/restaurant/${restaurant.id}`}>
                    <div className="card">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {restaurant.promo && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {restaurant.promo}
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center">
                          <FiStar className="text-yellow-500 fill-yellow-500 w-4 h-4 mr-1" />
                          <span className="text-sm font-semibold">{restaurant.rating}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{restaurant.cuisine}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500 text-sm">
                            <FiClock className="mr-1" />
                            {restaurant.deliveryTime}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <FiMapPin className="mr-1" />
                            {restaurant.deliveryFee === 0 ? 'Free' : `$${restaurant.deliveryFee}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section - KEEP AS IS */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=1600&auto=format')",
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-red-700/90"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Satisfy Your Cravings?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers and order delicious food today
            </p>
            <Link
              to={isAuthenticated ? "/restaurants" : "/register"}
              className="inline-flex items-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Order Now
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - KEEP AS IS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Restaurants" },
              { number: "10,000+", label: "Happy Customers" },
              { number: "30-40", label: "Minutes Delivery" },
              { number: "4.8", label: "Average Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;