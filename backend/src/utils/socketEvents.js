// Socket.io event names constants
const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Room events
  JOIN_CUSTOMER_ROOM: 'join_customer_room',
  JOIN_RESTAURANT_ROOM: 'join_restaurant_room',
  JOIN_DELIVERY_ROOM: 'join_delivery_room',
  
  // Order events
  NEW_ORDER: 'new_order',
  ORDER_STATUS_UPDATED: 'order_status_updated',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',
  ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Delivery events
  DELIVERY_ASSIGNED: 'delivery_assigned',
  DELIVERY_LOCATION_UPDATED: 'delivery_location_updated',
  
  // Payment events
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  
  // Notification events
  NOTIFICATION: 'notification',
  ORDER_NOTIFICATION: 'order_notification'
};

module.exports = SOCKET_EVENTS;