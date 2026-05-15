import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FiStar, FiClock, FiSearch, FiTruck, FiShield,
  FiAward, FiTag, FiArrowRight, FiMapPin, FiPhone,
  FiChevronRight, FiShoppingCart, FiCheckCircle
} from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HERO_SLIDES = [
  {
    title: 'Authentic Ethiopian Cuisine',
    subtitle: 'Experience the rich flavors of Gozamen Restaurant — delivered to your door',
    cta: 'Order Now',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&auto=format',
    badge: '🔥 Fresh & Authentic',
  },
  {
    title: 'Traditional Injera & Tibs',
    subtitle: 'Handcrafted with love using the finest Ethiopian spices and ingredients',
    cta: 'View Menu',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format',
    badge: '⚡ 30–40 Min Delivery',
  },
  {
    title: 'Pay with Telebirr or CBEBirr',
    subtitle: 'Fast, secure Ethiopian mobile payment — no cash needed',
    cta: 'Get Started',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format',
    badge: '💳 Easy Payments',
  },
];

const FEATURES = [
  { icon: <FiTruck />, title: 'Fast Delivery', desc: '30–40 min average', color: 'text-orange-500 bg-orange-50' },
  { icon: <FiShield />, title: 'Secure Payments', desc: 'Telebirr & CBEBirr', color: 'text-blue-500 bg-blue-50' },
  { icon: <FiAward />, title: 'Top Quality', desc: 'Fresh ingredients daily', color: 'text-yellow-500 bg-yellow-50' },
  { icon: <FiTag />, title: 'Best Prices', desc: 'Affordable Ethiopian food', color: 'text-green-500 bg-green-50' },
];

const WHY_US = [
  { icon: '🌿', title: 'Fresh Daily', desc: 'All ingredients sourced fresh every morning' },
  { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Trained in authentic Ethiopian cooking' },
  { icon: '📦', title: 'Safe Packaging', desc: 'Hygienic, spill-proof containers' },
  { icon: '⭐', title: '4.8 Rating', desc: 'Loved by hundreds of customers' },
];

const MenuItemCard = ({ item }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex">
    <div className="w-24 h-24 shrink-0 bg-gray-100 overflow-hidden">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&auto=format'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
      )}
    </div>
    <div className="flex-1 p-3 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
          {item.isVegetarian && (
            <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Veg</span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>
      <p className="font-bold text-orange-500 text-sm mt-1">Br {item.price?.toFixed(2)}</p>
    </div>
  </div>
);

const SkeletonItem = () => (
  <div className="bg-white rounded-xl border border-gray-100 flex animate-pulse">
    <div className="w-24 h-24 bg-gray-200 shrink-0" />
    <div className="flex-1 p-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuByCategory, setMenuByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Get the single restaurant
      const restRes = await api.get('/restaurants');
      const restaurants = restRes.data?.restaurants || [];
      if (restaurants.length === 0) { setLoading(false); return; }

      const r = restaurants[0];
      setRestaurant(r);

      // Get its menu
      const menuRes = await api.get(`/menu/restaurant/${r._id}`);
      const items = menuRes.data?.allItems || [];

      // Group by category
      const grouped = {};
      items.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      });
      setMenuByCategory(grouped);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: restaurant ? `/restaurant/${restaurant._id}` : '/' } });
      return;
    }
    if (restaurant) navigate(`/restaurant/${restaurant._id}`);
  };

  const handleViewMenu = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: restaurant ? `/restaurant/${restaurant._id}` : '/' } });
      return;
    }
    if (restaurant) navigate(`/restaurant/${restaurant._id}`);
  };

  const categories = ['all', ...Object.keys(menuByCategory)];

  const filteredMenu = Object.entries(menuByCategory).reduce((acc, [cat, items]) => {
    if (selectedCategory !== 'all' && selectedCategory !== cat) return acc;
    const filtered = searchTerm
      ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  const totalItems = Object.values(filteredMenu).flat().length;

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-[520px] md:h-[620px]">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-full"
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full">
                <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="max-w-xl">
                      <span className="inline-block bg-orange-500/90 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                        {slide.badge}
                      </span>
                      <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-white/80 text-lg mb-8">{slide.subtitle}</p>
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={handleOrderNow}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
                        >
                          {slide.cta} <FiArrowRight />
                        </button>
                        {!isAuthenticated && (
                          <Link
                            to="/register"
                            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-white/25 transition"
                          >
                            Sign Up Free
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── RESTAURANT INFO BANNER ── */}
      {restaurant && (
        <section className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 border border-orange-100 shrink-0">
                <img
                  src={restaurant.images?.logo || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&auto=format'}
                  alt="Gozamen"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&auto=format'; }}
                />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg">{restaurant.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <FiStar className="text-yellow-400 fill-yellow-400" size={13} />
                    {restaurant.rating?.toFixed(1) || '4.8'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={13} className="text-orange-400" />
                    {restaurant.estimatedDeliveryTime || 35} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin size={13} className="text-orange-400" />
                    {restaurant.address?.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiTruck size={13} className="text-orange-400" />
                    Br {restaurant.deliveryFee} delivery
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {restaurant.isOpen ? '● Open Now' : '● Closed'}
              </span>
              <button
                onClick={handleOrderNow}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm"
              >
                <FiShoppingCart size={14} /> Order Now
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${f.color}`}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MENU PREVIEW ── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Our Menu</h2>
              <p className="text-gray-500 mt-1">
                {loading ? 'Loading...' : `${Object.values(menuByCategory).flat().length} items available`}
              </p>
            </div>
            {restaurant && (
              <button
                onClick={handleViewMenu}
                className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                Full Menu <FiChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                placeholder="Search menu items..."
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {cat === 'all' ? 'All Items' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, si) => (
                <div key={si}>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
                  <div className="grid md:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => <SkeletonItem key={i} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : totalItems > 0 ? (
            <div className="space-y-8">
              {Object.entries(filteredMenu).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-orange-500 rounded-full inline-block" />
                    {category}
                    <span className="text-sm font-normal text-gray-400">({items.length})</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {items.map(item => <MenuItemCard key={item._id} item={item} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No items found</h3>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-orange-500 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* View Full Menu CTA */}
          {restaurant && !loading && totalItems > 0 && (
            <div className="text-center mt-10">
              <button
                onClick={handleViewMenu}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-orange-500/25"
              >
                <FiShoppingCart /> Order from Full Menu
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-14 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Why Choose Gozamen?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_US.map((w, i) => (
              <div key={i} className="text-center p-5 rounded-2xl hover:bg-orange-50 transition-colors">
                <div className="text-4xl mb-3">{w.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{w.title}</h3>
                <p className="text-sm text-gray-500">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-24 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=1600&auto=format"
          className="absolute inset-0 w-full h-full object-cover"
          alt="CTA background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 to-black/70" />
        <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to Order?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Authentic Ethiopian food from Gozamen Restaurant, delivered hot to your door
          </p>
          {isAuthenticated ? (
            <button
              onClick={handleOrderNow}
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3.5 rounded-full font-bold text-lg hover:bg-orange-50 transition shadow-xl"
            >
              Order Now <FiArrowRight />
            </button>
          ) : (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:from-orange-600 hover:to-red-600 transition shadow-xl"
              >
                Create Free Account <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-white/20 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🍽️</span>
                </div>
                <span className="font-extrabold text-white text-lg">Gozamen <span className="text-orange-500">Restaurant</span></span>
              </div>
              <p className="text-sm leading-relaxed">
                Authentic Ethiopian cuisine delivered to your door. Fresh ingredients, traditional recipes.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
                {restaurant && (
                  <li><button onClick={handleViewMenu} className="hover:text-orange-400 transition-colors">Full Menu</button></li>
                )}
                <li><Link to="/register" className="hover:text-orange-400 transition-colors">Register</Link></li>
                <li><Link to="/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact & Payments</h4>
              {restaurant && (
                <p className="text-sm flex items-center gap-1.5 mb-2">
                  <FiPhone size={13} /> {restaurant.contact?.phone || '0911000000'}
                </p>
              )}
              {restaurant && (
                <p className="text-sm flex items-center gap-1.5 mb-3">
                  <FiMapPin size={13} /> {restaurant.address?.street}, {restaurant.address?.city}
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                {['📱 Telebirr', '🏦 CBEBirr', '💵 Cash'].map(p => (
                  <span key={p} className="bg-gray-800 text-xs px-2 py-1 rounded-md">{p}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} Gozamen Restaurant, Addis Ababa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
