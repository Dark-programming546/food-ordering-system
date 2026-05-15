export const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return `Br ${num.toFixed(2)}`;
};

export const formatPriceShort = (price) => {
  const num = parseFloat(price) || 0;
  return `Br ${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
};