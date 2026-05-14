import React, { useState } from 'react';
import { FiX, FiSmartphone, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { paymentService } from '../../services/api';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, orderId, amount, paymentMethod, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getMethodDetails = () => {
    if (paymentMethod === 'telebirr') {
      return {
        title: 'Telebirr Payment',
        icon: '📱',
        placeholder: '09XXXXXXXX',
        hint: 'Enter your Telebirr registered phone number'
      };
    } else if (paymentMethod === 'cbebirr') {
      return {
        title: 'CBEBirr Payment',
        icon: '🏦',
        placeholder: '09XXXXXXXX',
        hint: 'Enter your CBEBirr registered phone number'
      };
    }
    return null;
  };

  const methodDetails = getMethodDetails();
  if (!methodDetails) return null;

  const validatePhone = (phone) => {
    const phoneRegex = /^(09|07)\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhone(phoneNumber)) {
      toast.error('Please enter a valid Ethiopian phone number (09XXXXXXXX or 07XXXXXXXX)');
      return;
    }

    setLoading(true);

    try {
      const response = await paymentService.initiate(orderId, paymentMethod, phoneNumber);
      
      if (response.data.success) {
        toast.success('Payment successful! Redirecting...');
        // Call onSuccess first with the payment data
        onSuccess(response.data.payment);
        // Close modal
        onClose();
      } else {
        toast.error(response.data.message || 'Payment failed');
        setLoading(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Payment processing failed';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{methodDetails.icon}</span>
            <h2 className="text-xl font-bold text-gray-800">{methodDetails.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-orange-500 mb-2">ETB {amount?.toFixed(2) || '0.00'}</div>
            <p className="text-gray-500">Amount to pay</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={methodDetails.placeholder}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{methodDetails.hint}</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <FiSmartphone />
                You will receive a push notification on your phone to complete the payment
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiCheckCircle /> Pay ETB {amount?.toFixed(2) || '0.00'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;