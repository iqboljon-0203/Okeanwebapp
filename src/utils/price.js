export const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
};

export const calculateDiscount = (price, discountPrice) => {
  if (!discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};
