import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart, getCartSummary } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const summary = getCartSummary();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition mb-4">
            <FiArrowLeft /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-500">{cartCount} items</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Restaurant Info */}
              <div className="border-b p-4 bg-gray-50">
                <p className="font-semibold text-gray-800">Ordering from: {cart[0]?.restaurantName}</p>
              </div>

              {/* Cart Items List */}
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="p-4 flex items-center gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍕</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-orange-500 font-bold">{formatPrice(item.price)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                             <button
                                 onClick={() => {
                                      removeFromCart(item.menuItemId);
                                     toast.success('Item removed from cart');
                                             }}
                         className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 mt-1"
                                                                                   >
                <FiTrash2 className="w-3 h-3" /> Remove
                                                </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="border-t p-4 bg-gray-50">
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                >
                  <FiTrash2 /> Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(parseFloat(summary.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatPrice(parseFloat(summary.deliveryFee))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">{formatPrice(parseFloat(summary.tax))}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-orange-500 text-xl">{formatPrice(parseFloat(summary.total))}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout <FiArrowRight />
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Taxes and delivery fee calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;