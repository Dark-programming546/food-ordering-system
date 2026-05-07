const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// Socket manager will be set from server
let socketManager = null;

// Function to set socket manager (called from server)
const setSocketManager = (manager) => {
  socketManager = manager;
};

// Helper function to generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// @desc    Create order from cart
// @route   POST /api/orders/create
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      paymentMethod,
      specialRequests
    } = req.body;
    
    // Validate payment method
    if (!paymentMethod || !['cash', 'card', 'online'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (cash, card, online)'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Get restaurant details
    const restaurant = await Restaurant.findById(cart.items[0].restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Check if restaurant is open
    if (!restaurant.isOpen || !restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: `${restaurant.name} is currently closed`
      });
    }
    
    // Check minimum order
    if (cart.totalAmount < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${restaurant.minimumOrder}. Your total is $${cart.totalAmount.toFixed(2)}`
      });
    }
    
    // Get customer details
    const customer = await User.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Use provided delivery address or customer's saved address
    const finalDeliveryAddress = deliveryAddress || customer.address;
    if (!finalDeliveryAddress || !finalDeliveryAddress.street) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required. Please provide an address or update your profile.'
      });
    }
    
    // Calculate totals
    const subtotal = cart.totalAmount;
    const deliveryFee = restaurant.deliveryFee;
    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + deliveryFee + tax;
    
    // Prepare order items
    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || ''
    }));
    
    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      customer: req.user.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      deliveryAddress: finalDeliveryAddress,
      restaurant: restaurant._id,
      restaurantName: restaurant.name,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      paymentMethod,
      specialRequests: specialRequests || '',
      orderStatus: 'pending',
      timeline: [{
        status: 'pending',
        note: 'Order placed successfully',
        updatedBy: req.user.id
      }],
      estimatedDeliveryTime: new Date(Date.now() + restaurant.estimatedDeliveryTime * 60000)
    });
    
    await order.save();
    
    // Clear cart after order
    await cart.clearCart();
    
    // 🔴 SOCKET.IO: Notify restaurant about new order in real-time
    try {
      if (socketManager) {
        socketManager.notifyNewOrder(restaurant._id.toString(), {
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          items: order.items,
          createdAt: order.createdAt
        });
        console.log(`✅ Real-time notification sent to restaurant ${restaurant.name}`);
      }
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        restaurantName: order.restaurantName,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        timeline: order.timeline,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/customer
// @access  Private (Customer)
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name images.logo');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get restaurant orders
// @route   GET /api/orders/restaurant
// @access  Private (Restaurant)
const getRestaurantOrders = async (req, res) => {
  try {
    // Get restaurant owned by this user
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found. Please create a restaurant profile first.'
      });
    }
    
    const { status, limit = 50, page = 1 } = req.query;
    let filter = { restaurant: restaurant._id };
    
    if (status) {
      filter.orderStatus = status;
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Order.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get delivery person orders
// @route   GET /api/orders/delivery
// @access  Private (Delivery)
const getDeliveryOrders = async (req, res) => {
  try {
    // Get orders assigned to this delivery person
    const assignedOrders = await Order.find({ 
      deliveryPerson: req.user.id,
      orderStatus: { $in: ['ready', 'out-for-delivery'] }
    }).sort({ createdAt: -1 });
    
    // Get available orders (ready for pickup)
    const availableOrders = await Order.find({ 
      orderStatus: 'ready',
      deliveryPerson: { $exists: false }
    }).sort({ createdAt: 1 });
    
    // Get delivery history
    const deliveryHistory = await Order.find({ 
      deliveryPerson: req.user.id,
      orderStatus: 'delivered'
    }).sort({ createdAt: -1 }).limit(20);
    
    res.status(200).json({
      success: true,
      assignedOrders,
      availableOrders,
      deliveryHistory
    });
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Customer/Restaurant/Delivery/Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address contact')
      .populate('deliveryPerson', 'name phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user.id;
    const restaurantOwner = await Restaurant.findOne({ owner: req.user.id, _id: order.restaurant._id });
    const isRestaurant = !!restaurantOwner;
    const isDelivery = order.deliveryPerson && order.deliveryPerson._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCustomer && !isRestaurant && !isDelivery && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status (Restaurant)
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const { id } = req.params;
    
    const validStatuses = ['confirmed', 'preparing', 'ready', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant || restaurant._id.toString() !== order.restaurant.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }
    
    // Don't allow status update if order is already delivered or cancelled
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update order that is already ${order.orderStatus}`
      });
    }
    
    await order.updateStatus(status, req.user.id, note || `Order status updated to ${status}`);
    
    // 🔴 SOCKET.IO: Notify customer about status change in real-time
    try {
      if (socketManager) {
        socketManager.notifyOrderStatusUpdate(
          order.customer.toString(),
          order._id.toString(),
          status,
          note || `Order status updated to ${status}`
        );
        console.log(`✅ Real-time status update sent to customer for order ${order.orderNumber}`);
      }
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }
    
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Assign delivery person (Restaurant)
// @route   PUT /api/orders/:id/assign-delivery
// @access  Private (Restaurant)
const assignDeliveryPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant || restaurant._id.toString() !== order.restaurant.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Check if delivery person exists and has correct role
    const deliveryPerson = await User.findOne({ _id: deliveryPersonId, role: 'delivery' });
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found'
      });
    }
    
    order.deliveryPerson = deliveryPersonId;
    await order.save();
    
    // 🔴 SOCKET.IO: Notify customer and delivery person about assignment
    try {
      if (socketManager) {
        socketManager.notifyDeliveryAssigned(
          order.customer.toString(),
          order._id.toString(),
          deliveryPerson
        );
        socketManager.notifyDeliveryPersonAssigned(deliveryPersonId, order);
        console.log(`✅ Real-time delivery assignment notifications sent for order ${order.orderNumber}`);
      }
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Delivery person assigned successfully',
      order
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update delivery status (Delivery Person)
// @route   PUT /api/orders/:id/delivery-status
// @access  Private (Delivery)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const { id } = req.params;
    
    const validStatuses = ['out-for-delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if delivery person is assigned to this order
    if (!order.deliveryPerson || order.deliveryPerson.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not assigned to this order'
      });
    }
    
    // Check if order is ready for delivery
    if (status === 'out-for-delivery' && order.orderStatus !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order must be ready before out for delivery'
      });
    }
    
    await order.updateStatus(status, req.user.id, note || `Delivery status: ${status}`);
    
    // 🔴 SOCKET.IO: Notify customer about delivery status change
    try {
      if (socketManager) {
        socketManager.notifyOrderStatusUpdate(
          order.customer.toString(),
          order._id.toString(),
          status,
          note || `Delivery status: ${status}`
        );
        console.log(`✅ Real-time delivery status update sent to customer for order ${order.orderNumber}`);
      }
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }
    
    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Track order (public)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .select('orderNumber orderStatus timeline estimatedDeliveryTime customerName restaurantName');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get status timeline
    const timeline = order.timeline.map(t => ({
      status: t.status,
      timestamp: t.timestamp,
      note: t.note
    }));
    
    res.status(200).json({
      success: true,
      tracking: {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        customerName: order.customerName,
        restaurantName: order.restaurantName,
        estimatedDelivery: order.estimatedDeliveryTime,
        timeline
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order (Customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled (only pending or confirmed)
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order that is already ${order.orderStatus}`
      });
    }
    
    await order.updateStatus('cancelled', req.user.id, 'Order cancelled by customer');
    
    // 🔴 SOCKET.IO: Notify restaurant about cancellation
    try {
      if (socketManager) {
        const restaurant = await Restaurant.findOne({ _id: order.restaurant });
        if (restaurant) {
          socketManager.notifyOrderStatusUpdate(
            order.customer.toString(),
            order._id.toString(),
            'cancelled',
            'Order cancelled by customer'
          );
        }
        console.log(`✅ Real-time cancellation notification sent`);
      }
    } catch (socketError) {
      console.error('Socket notification error:', socketError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getRestaurantOrders,
  getDeliveryOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryPerson,
  updateDeliveryStatus,
  trackOrder,
  cancelOrder,
  setSocketManager
};