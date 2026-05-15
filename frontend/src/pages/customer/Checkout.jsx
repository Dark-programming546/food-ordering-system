import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiSmartphone, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { cartService } from '../../services/api';
import PaymentModal from '../../components/common/PaymentModal';

const Checkout = () => {
  const { cart, getCartSummary, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const summary = getCartSummary();

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [pendingOrderTotal, setPendingOrderTotal] = useState(0);
  
  const hasSynced = useRef(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart && cart.length === 0) {
      window.location.reload();
    }
  }, [cart]);

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cart, navigate, orderPlaced]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const syncCartToBackend = async () => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    try {
      // clearCart returns 404 if no cart exists yet — that's fine, ignore it
      await cartService.clearCart().catch(() => {});
      for (const item of cart) {
        await cartService.addItem(item.menuItemId, item.quantity, item.specialInstructions || '');
      }
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  };

  // Handle payment success - navigate directly to confirmation
  const handlePaymentSuccess = async (payment) => {
    console.log('💰 Payment success, orderId:', pendingOrderId);
    
    if (!pendingOrderId) {
      console.error('No pending order ID!');
      toast.error('Error: Order ID not found');
      return;
    }
    
    clearCart();
    navigate(`/order-confirmation/${pendingOrderId}`);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    // Don't clear pendingOrderId immediately, we need it for navigation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading || orderPlaced) return;
    
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      await syncCartToBackend();
      
      const orderData = {
        deliveryAddress: address,
        paymentMethod: paymentMethod,
        specialRequests: specialRequests
      };
      
      const response = await orderService.create(orderData);
      
      if (response.data.success) {
        const order = response.data.order;
        console.log('✅ Order created, ID:', order.id);
        console.log('✅ Order number:', order.orderNumber);
        
        if (paymentMethod === 'cash') {
          setOrderPlaced(true);
          toast.success('Order placed successfully!');
          clearCart();
          navigate(`/order-confirmation/${order.id}`);
        } else {
          // Store order ID first, then show modal
          setPendingOrderId(order.id);
          setPendingOrderTotal(parseFloat(summary.total));
          setShowPaymentModal(true);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
      hasSynced.current = false;
      setLoading(false);
    }
  };

  const handleRefreshCart = () => {
    window.location.reload();
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your cart...</p>
          <button onClick={handleRefreshCart} className="mt-4 text-orange-500 underline">
            Refresh Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition mb-4">
            <FiArrowLeft /> Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-500">Complete your order</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Addis Ababa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ethiopia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiCreditCard className="text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <FiDollarSign className="text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="telebirr"
                    checked={paymentMethod === 'telebirr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <FiSmartphone className="text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">Telebirr</p>
                    <p className="text-sm text-gray-500">Pay using Telebirr mobile money</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cbebirr"
                    checked={paymentMethod === 'cbebirr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <FiSmartphone className="text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-800">CBEBirr</p>
                    <p className="text-sm text-gray-500">Pay using CBEBirr mobile banking</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Special Requests</h2>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="3"
                placeholder="Any special instructions for the restaurant?"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Items ({summary.itemCount})</span>
                  <span>${summary.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${summary.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${summary.tax}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-orange-500 text-xl">${summary.total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || orderPlaced}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheckCircle /> Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        orderId={pendingOrderId}
        amount={pendingOrderTotal}
        paymentMethod={paymentMethod}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Checkout;