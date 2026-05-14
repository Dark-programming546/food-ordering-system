import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import { FiCheckCircle, FiPackage, FiClock, FiMapPin, FiCreditCard, FiAlertCircle } from 'react-icons/fi';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderService.getById(id);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get payment status color and icon
  const getPaymentStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: <FiCheckCircle className="w-4 h-4" />, label: 'Paid' };
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <FiClock className="w-4 h-4" />, label: 'Pending' };
      case 'failed':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: <FiAlertCircle className="w-4 h-4" />, label: 'Failed' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <FiClock className="w-4 h-4" />, label: status || 'Pending' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  const paymentConfig = getPaymentStatusConfig(order?.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
          <p className="text-gray-500 mt-1">Thank you for your order</p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="border-b p-4 bg-gray-50">
            <p className="font-semibold text-gray-800">Order #{order?.orderNumber}</p>
            <p className="text-sm text-gray-500">Placed on {new Date(order?.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Order Status */}
            <div className="flex items-center gap-3">
              <FiPackage className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="font-semibold text-gray-800 capitalize">{order?.orderStatus}</p>
              </div>
            </div>

            {/* Day 6: Payment Status - New Addition */}
            <div className="flex items-center gap-3">
              <div className={`${paymentConfig.bg} p-1.5 rounded-full`}>
                {paymentConfig.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className={`font-semibold capitalize ${paymentConfig.color}`}>
                  {paymentConfig.label}
                  {order?.transactionId && (
                    <span className="text-xs text-gray-400 ml-2">
                      ({order.transactionId})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-center gap-3">
              <FiMapPin className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="text-gray-800">
                  {order?.deliveryAddress?.street}<br />
                  {order?.deliveryAddress?.city}, {order?.deliveryAddress?.state} {order?.deliveryAddress?.zipCode}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-gray-800 capitalize">
                  {order?.paymentMethod === 'cash' ? 'Cash on Delivery' : 
                   order?.paymentMethod === 'telebirr' ? 'Telebirr' : 
                   order?.paymentMethod === 'cbebirr' ? 'CBEBirr' : order?.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="border-b p-4 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Order Items</h2>
          </div>
          <div className="divide-y">
            {order?.items?.map((item, index) => (
              <div key={index} className="p-4 flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-orange-500">${order?.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/customer/orders"
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition text-center"
          >
            Track Order
          </Link>
          <Link
            to="/"
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;