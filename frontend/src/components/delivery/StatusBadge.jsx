const STATUS = {
  pending:            { label: 'Pending',           color: 'bg-yellow-100 text-yellow-700' },
  confirmed:          { label: 'Confirmed',          color: 'bg-blue-100 text-blue-700' },
  preparing:          { label: 'Preparing',          color: 'bg-orange-100 text-orange-700' },
  ready:              { label: 'Ready for Pickup',   color: 'bg-purple-100 text-purple-700' },
  'out-for-delivery': { label: 'In Transit',         color: 'bg-indigo-100 text-indigo-700' },
  delivered:          { label: 'Delivered',          color: 'bg-green-100 text-green-700' },
  cancelled:          { label: 'Cancelled',          color: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
