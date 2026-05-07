const SOCKET_EVENTS = require('../utils/socketEvents');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.customers = new Map(); // customerId -> socketId
    this.restaurants = new Map(); // restaurantId -> socketId
    this.deliveryPersons = new Map(); // deliveryPersonId -> socketId
    this.orderRooms = new Map(); // orderId -> room name
  }

  initialize() {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      // Handle joining customer room
      socket.on(SOCKET_EVENTS.JOIN_CUSTOMER_ROOM, (data) => {
        const { customerId } = data;
        if (customerId) {
          this.customers.set(customerId, socket.id);
          socket.join(`customer_${customerId}`);
          console.log(`✅ Customer ${customerId} joined room`);
          socket.emit(SOCKET_EVENTS.NOTIFICATION, {
            message: 'Connected to real-time updates',
            timestamp: new Date()
          });
        }
      });

      // Handle joining restaurant room
      socket.on(SOCKET_EVENTS.JOIN_RESTAURANT_ROOM, (data) => {
        const { restaurantId } = data;
        if (restaurantId) {
          this.restaurants.set(restaurantId, socket.id);
          socket.join(`restaurant_${restaurantId}`);
          console.log(`✅ Restaurant ${restaurantId} joined room`);
          socket.emit(SOCKET_EVENTS.NOTIFICATION, {
            message: 'Restaurant connected - you will receive real-time orders',
            timestamp: new Date()
          });
        }
      });

      // Handle joining delivery room
      socket.on(SOCKET_EVENTS.JOIN_DELIVERY_ROOM, (data) => {
        const { deliveryPersonId } = data;
        if (deliveryPersonId) {
          this.deliveryPersons.set(deliveryPersonId, socket.id);
          socket.join(`delivery_${deliveryPersonId}`);
          console.log(`✅ Delivery person ${deliveryPersonId} joined room`);
        }
      });

      // Handle delivery location updates
      socket.on(SOCKET_EVENTS.DELIVERY_LOCATION_UPDATED, (data) => {
        const { orderId, location } = data;
        this.io.to(`order_${orderId}`).emit(SOCKET_EVENTS.DELIVERY_LOCATION_UPDATED, {
          orderId,
          location,
          timestamp: new Date()
        });
      });

      // Handle disconnection
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        this.removeSocket(socket.id);
      });
    });
  }

  removeSocket(socketId) {
    for (let [key, value] of this.customers) {
      if (value === socketId) this.customers.delete(key);
    }
    for (let [key, value] of this.restaurants) {
      if (value === socketId) this.restaurants.delete(key);
    }
    for (let [key, value] of this.deliveryPersons) {
      if (value === socketId) this.deliveryPersons.delete(key);
    }
  }

  // Notify restaurant about new order
  notifyNewOrder(restaurantId, order) {
    const room = `restaurant_${restaurantId}`;
    this.io.to(room).emit(SOCKET_EVENTS.NEW_ORDER, {
      order,
      message: `📦 New order #${order.orderNumber} received!`,
      timestamp: new Date()
    });
    
    // Also send a notification sound trigger
    this.io.to(room).emit(SOCKET_EVENTS.NOTIFICATION, {
      type: 'new_order',
      title: 'New Order!',
      message: `Order #${order.orderNumber} - ${order.totalAmount} ETB`,
      sound: true,
      timestamp: new Date()
    });
  }

  // Notify customer about order status update
  notifyOrderStatusUpdate(customerId, orderId, status, note) {
    const room = `customer_${customerId}`;
    const statusMessages = {
      confirmed: '✅ Your order has been confirmed!',
      preparing: '👨‍🍳 The restaurant is preparing your order!',
      ready: '📦 Your order is ready for pickup!',
      'out-for-delivery': '🚚 Your order is out for delivery!',
      delivered: '🎉 Your order has been delivered! Enjoy your meal!',
      cancelled: '❌ Your order has been cancelled.'
    };
    
    this.io.to(room).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATED, {
      orderId,
      status,
      note,
      message: statusMessages[status] || `Order status updated to ${status}`,
      timestamp: new Date()
    });
    
    this.io.to(room).emit(SOCKET_EVENTS.NOTIFICATION, {
      type: 'order_update',
      title: 'Order Update',
      message: statusMessages[status] || `Order status: ${status}`,
      timestamp: new Date()
    });
  }

  // Notify customer about delivery assignment
  notifyDeliveryAssigned(customerId, orderId, deliveryPerson) {
    const room = `customer_${customerId}`;
    this.io.to(room).emit(SOCKET_EVENTS.DELIVERY_ASSIGNED, {
      orderId,
      deliveryPerson: {
        name: deliveryPerson.name,
        phone: deliveryPerson.phone
      },
      message: `🚚 ${deliveryPerson.name} has been assigned to deliver your order!`,
      timestamp: new Date()
    });
  }

  // Notify delivery person about new assignment
  notifyDeliveryPersonAssigned(deliveryPersonId, order) {
    const room = `delivery_${deliveryPersonId}`;
    this.io.to(room).emit(SOCKET_EVENTS.DELIVERY_ASSIGNED, {
      order,
      message: `📦 New delivery assigned: Order #${order.orderNumber}`,
      timestamp: new Date()
    });
  }

  // Notify customer about payment success
  notifyPaymentSuccess(customerId, orderId, paymentDetails) {
    const room = `customer_${customerId}`;
    this.io.to(room).emit(SOCKET_EVENTS.PAYMENT_SUCCESS, {
      orderId,
      paymentDetails,
      message: `💰 Payment of ${paymentDetails.amount} ETB successful!`,
      timestamp: new Date()
    });
  }

  // Broadcast to all admins (for system notifications)
  notifyAdmin(event, data) {
    this.io.emit(event, data);
  }

  // Join order room for real-time tracking
  joinOrderRoom(socket, orderId) {
    const room = `order_${orderId}`;
    socket.join(room);
    this.orderRooms.set(orderId, room);
    return room;
  }
}

module.exports = SocketManager;