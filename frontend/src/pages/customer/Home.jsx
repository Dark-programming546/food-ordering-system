import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../services/restaurantService';
import {
  FiArrowRight,
  FiStar,
  FiClock,
  FiSearch,
  FiTruck,
  FiShield,
  FiCreditCard
} from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [cuisines, setCuisines] = useState([]);

  const heroSlides = [
    {
      title: "Craving Something Delicious?",
      subtitle: "Order from the best restaurants in your city",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format"
    },
    {
      title: "Fresh Food, Fast Delivery",
      subtitle: "Hot meals delivered right to your doorstep",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1600&auto=format"
    },
    {
      title: "Special Discounts Every Day",
      subtitle: "Save up to 50% on your favorite dishes",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format"
    }
  ];

  const features = [
    { icon: <FiTruck />, title: "Fast Delivery", desc: "Get food in 30–40 minutes" },
    { icon: <FiShield />, title: "Secure Payments", desc: "Telebirr, Cash, CBEBirr" },
    { icon: <FiStar />, title: "Best Quality", desc: "Top restaurants only" },
    { icon: <FiCreditCard />, title: "Best Prices", desc: "Daily discounts available" }
  ];

  const categories = [
    { name: "Pizza", icon: "🍕" }, { name: "Burgers", icon: "🍔" },
    { name: "Sushi", icon: "🍣" }, { name: "Indian", icon: "🍛" },
    { name: "Chinese", icon: "🥡" }, { name: "Italian", icon: "🍝" },
    { name: "Mexican", icon: "🌮" }, { name: "Desserts", icon: "🍰" }
  ];

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCuisine) params.cuisine = selectedCuisine;

      const data = await restaurantService.getAll(params);
      
      // Fix: Pulling restaurants correctly from your API response structure
      const restaurants = data?.restaurants || data?.data?.restaurants || data?.data || [];
      setFeaturedRestaurants(restaurants);

      const allCuisines = new Set();
      restaurants.forEach(r => {
        if (Array.isArray(r.cuisine)) {
          r.cuisine.forEach(c => allCuisines.add(c));
        } else if (r.cuisine) {
          allCuisines.add(r.cuisine);
        }
      });
      setCuisines([...allCuisines]);
    } catch (err) {
      console.error("Fetch Error:", err);
      setFeaturedRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm, selectedCuisine]);

  return (
    <div className="overflow-x-hidden bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="relative h-[500px] md:h-[600px]">
        <Swiper modules={[Autoplay, Pagination, Navigation, EffectFade]} effect="fade" autoplay={{ delay: 5000 }} pagination={{ clickable: true }} navigation loop className="h-full">
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <img src={slide.image} className="w-full h-full object-cover" alt="Hero" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center text-white">
                <div className="px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                  <p className="mb-6">{slide.subtitle}</p>
                  <Link className="bg-orange-500 px-8 py-3 rounded-full font-bold">Get Started</Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* SEARCH */}
      <div className="sticky top-0 bg-white shadow-md py-4 z-20">
        <div className="max-w-7xl mx-auto px-4 flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 py-2 border rounded-lg outline-none" placeholder="Search restaurants..." />
          </div>
          <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)} className="border rounded-lg px-4 outline-none">
            <option value="">All Cuisines</option>
            {cuisines.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* FEATURED RESTAURANTS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Featured Restaurants</h2>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredRestaurants.length > 0 ? (
                // Force display of exactly 6 slots
                Array.from({ length: 6 }).map((_, i) => {
                  const r = featuredRestaurants[i % featuredRestaurants.length];
                  
                  // Meal placeholder images in case the database link is broken or "Wok & Roll" has an issue
                  const fallbackMeals = [
                    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", // Pizza
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500", // Burger
                    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500", // Sushi
                    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500", // Pasta
                    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=500", // Indian
                    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500"  // Tacos
                  ];

                  // Priority: 1. DB cover, 2. DB image, 3. Fallback list
                  const coverImage = r.images?.cover || r.image || fallbackMeals[i % fallbackMeals.length];

                  // 🔥 ONLY CHANGE: Added <Link> wrapper around the card
                  return (
                    <Link to={`/restaurant/${r._id}`} key={i} className="block transition-transform hover:scale-[1.02]">
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-100">
                        <div className="h-48 w-full overflow-hidden bg-gray-100">
                          <img 
                            src={coverImage} 
                            className="w-full h-full object-cover" 
                            alt={r.name || "Restaurant"}
                            onError={(e) => { e.target.src = fallbackMeals[i % fallbackMeals.length]; }}
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-xl mb-1 text-gray-800">{r.name || "Delicious Eats"}</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {Array.isArray(r.cuisine) ? r.cuisine.join(", ") : (r.cuisine || "Specialty Food")}
                          </p>
                          <div className="mt-auto pt-3 border-t flex justify-between text-sm font-medium text-gray-600">
                            <span className="flex items-center gap-1"><FiClock className="text-orange-500" /> {r.deliveryTime || "30-40 min"}</span>
                            <span className="flex items-center gap-1"><FiStar className="text-yellow-500" /> {r.rating || 4.7}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-10">No restaurants found in Database.</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="text-center">
              <div className="text-orange-500 text-3xl mb-2 flex justify-center">{f.icon}</div>
              <h3 className="font-bold text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
          {categories.map((c, i) => (
            <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-xs font-semibold">{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 text-center text-white">
        <img src="https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=1600" className="absolute inset-0 w-full h-full object-cover" alt="CTA" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Satisfy Your Cravings?</h2>
          <p className="mb-8 text-lg">Join thousands of happy customers today</p>
          <Link className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2">
            Order Now <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;