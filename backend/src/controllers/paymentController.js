const Payment = require('../models/Payment');
const Order = require('../models/Order');
const PaymentService = require('../services/paymentService');

// @desc    Initialize payment for an order
// @route   POST /api/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, phoneNumber } = req.body;
    
    // Validate payment method
    if (!['telebirr', 'cbebirr', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Use: telebirr, cbebirr, or cash'
      });
    }
    
    // Get order details
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }
    
    // Check if payment already exists
    let existingPayment = await Payment.findOne({ order: orderId });
    
    if (existingPayment && existingPayment.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }
    
    // For cash payment, just update order
    if (paymentMethod === 'cash') {
      order.paymentStatus = 'pending';
      order.paymentMethod = 'cash';
      await order.save();
      
      // Create payment record
      const payment = await Payment.create({
        order: orderId,
        user: req.user.id,
        amount: order.totalAmount,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        paymentDate: new Date()
      });
      
      return res.status(200).json({
        success: true,
        message: 'Cash payment selected. Please pay on delivery.',
        payment: {
          id: payment._id,
          method: 'cash',
          amount: order.totalAmount,
          status: 'pending'
        }
      });
    }
    
    // For Telebirr or CBEBirr, validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for mobile payment'
      });
    }
    
    // Validate Ethiopian phone number (09xxxxxxxx or 07xxxxxxxx)
    const phoneRegex = /^(09|07)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethiopian phone number. Format: 09xxxxxxxx or 07xxxxxxxx'
      });
    }
    
    // Create payment record
    let payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      amount: order.totalAmount,
      paymentMethod: paymentMethod,
      paymentStatus: 'processing',
      [paymentMethod]: {
        phoneNumber: phoneNumber
      }
    });
    
    // Process payment based on method
    let paymentResult;
    
    if (paymentMethod === 'telebirr') {
      paymentResult = await PaymentService.processTelebirrPayment(
        order.totalAmount,
        phoneNumber,
        orderId
      );
    } else if (paymentMethod === 'cbebirr') {
      paymentResult = await PaymentService.processCBEBirrPayment(
        order.totalAmount,
        phoneNumber,
        orderId
      );
    } else {
      paymentResult = { success: false, message: 'Unknown payment method' };
    }
    
    // Update payment record with result
    if (paymentResult.success) {
      payment.paymentStatus = 'completed';
      payment.transactionId = paymentResult.transactionId;
      payment.paymentResponse = paymentResult;
      if (paymentResult.receiptNumber) {
        payment[paymentMethod].receiptNumber = paymentResult.receiptNumber;
      }
      payment.paymentDate = paymentResult.paymentDate || new Date();
      
      await payment.save();
      
      // Update order payment status
      order.paymentStatus = 'paid';
      order.paymentId = paymentResult.transactionId;
      await order.save();
      
      // Add to timeline
      const OrderModel = require('../models/Order');
      await OrderModel.findByIdAndUpdate(orderId, {
        $push: {
          timeline: {
            status: order.orderStatus,
            note: `Payment of ${order.totalAmount.toFixed(2)} ETB completed via ${paymentMethod}`,
            updatedBy: req.user.id,
            timestamp: new Date()
          }
        }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Payment successful!',
        payment: {
          id: payment._id,
          transactionId: payment.transactionId,
          method: paymentMethod,
          amount: order.totalAmount,
          status: 'completed',
          receiptNumber: paymentResult.receiptNumber
        }
      });
    } else {
      payment.paymentStatus = 'failed';
      payment.paymentResponse = paymentResult;
      await payment.save();
      
      return res.status(400).json({
        success: false,
        message: paymentResult.message || 'Payment failed',
        error: paymentResult.error,
        payment: {
          id: payment._id,
          status: 'failed'
        }
      });
    }
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify payment status
// @route   GET /api/payments/verify/:paymentId
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId)
      .populate('order', 'orderNumber totalAmount');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        orderNumber: payment.order?.orderNumber,
        amount: payment.amount,
        method: payment.paymentMethod,
        status: payment.paymentStatus,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate,
        receiptNumber: payment[payment.paymentMethod]?.receiptNumber
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber totalAmount orderStatus');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments.map(p => ({
        id: p._id,
        orderNumber: p.order?.orderNumber,
        amount: p.amount,
        method: p.paymentMethod,
        status: p.paymentStatus,
        transactionId: p.transactionId,
        date: p.paymentDate || p.createdAt,
        receiptNumber: p[p.paymentMethod]?.receiptNumber
      }))
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId)
      .populate('order', 'orderNumber totalAmount items restaurantName deliveryAddress')
      .populate('user', 'name email phone');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Webhook for payment callbacks
// @route   POST /api/payments/webhook/telebirr
// @access  Public
const telebirrWebhook = async (req, res) => {
  try {
    const { transactionId, status, receiptNumber, amount } = req.body;
    
    console.log('Telebirr webhook received:', { transactionId, status });
    
    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    if (status === 'success') {
      payment.paymentStatus = 'completed';
      payment.paymentResponse = req.body;
      if (receiptNumber && payment[payment.paymentMethod]) {
        payment[payment.paymentMethod].receiptNumber = receiptNumber;
      }
      await payment.save();
      
      // Update order
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
      }
    } else if (status === 'failed') {
      payment.paymentStatus = 'failed';
      payment.paymentResponse = req.body;
      await payment.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook error'
    });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  telebirrWebhook
};