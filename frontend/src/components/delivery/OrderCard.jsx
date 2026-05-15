import { FiMapPin, FiPhone, FiNavigation, FiCheckCircle, FiPackage, FiClock } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order, onPickUp, onDeliver, loading }) {
  const isReady = order.orderStatus === 'ready';
  const isInTransit = order.orderStatus === 'out-for-delivery';
  const address = `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const timeAgo = Math.round((Date.now() - new Date(order.createdAt)) / 60000);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-gray-900">#{order.orderNumber}</p>
          <p className="text-sm text-gray-500">{order.restaurantName}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <FiClock size={11} /> {timeAgo} min ago
          </p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Customer & Address */}
      <div className="space-y-1.5 text-sm">
        <p className="flex items-center gap-2 text-gray-700">
          <FiPhone size={13} className="text-orange-400 shrink-0" />
          <span className="font-medium">{order.customerName}</span>
          {order.customerPhone && (
            <a href={`tel:${order.customerPhone}`}
              className="text-orange-500 hover:text-orange-600 font-semibold ml-auto">
              Call
            </a>
          )}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <FiMapPin size={13} className="text-orange-400 shrink-0" />
          <span className="truncate">{address}</span>
          <a href={mapsUrl} target="_blank" rel="noreferrer"
            className="text-blue-500 hover:text-blue-600 ml-auto shrink-0 flex items-center gap-1 text-xs font-semibold">
            <FiNavigation size={11} /> Navigate
          </a>
        </p>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-gray-600">
            <span>{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between text-sm font-bold">
          <span>Total</span>
          <span className="text-orange-500">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isReady && onPickUp && (
          <button onClick={() => onPickUp(order._id)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiPackage size={14} />}
            Mark Picked Up
          </button>
        )}
        {isInTransit && onDeliver && (
          <button onClick={() => onDeliver(order._id)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheckCircle size={14} />}
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
}
