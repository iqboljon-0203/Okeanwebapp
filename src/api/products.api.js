const PRODUCTS = [
  {
    id: 1,
    name: "Yangi pishgan Ananas (Gold)",
    price: 32000,
    discountPrice: null,
    unit: "dona",
    step: 1,
    image: "https://images.unsplash.com/photo-1550258114-68bd2927ed9d?w=600&h=600&fit=crop",
    categoryId: "meva-sabzavot",
    isAvailable: true,
    isPopular: true
  },
  {
    id: 2,
    name: "Premium Banan (Ekvador)",
    price: 18500,
    discountPrice: 15000,
    unit: "kg",
    step: 0.5,
    image: "https://images.unsplash.com/photo-1571771894821-ad996211fdf4?w=600&h=600&fit=crop",
    categoryId: "meva-sabzavot",
    isAvailable: true,
    isPopular: true,
    stock: 3
  },
  {
    id: 3,
    name: "Sarhil Qulupnay (Issiqxona)",
    price: 45000,
    discountPrice: null,
    unit: "kg",
    step: 0.5,
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=600&fit=crop",
    categoryId: "meva-sabzavot",
    isAvailable: true,
    isPopular: true
  },
  {
    id: 4,
    name: "Uzum 'Toyfi' (Mahalliy)",
    price: 22000,
    discountPrice: null,
    unit: "kg",
    step: 1,
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=600&fit=crop",
    categoryId: "meva-sabzavot",
    isAvailable: true,
    isPopular: false
  },
  {
    id: 5,
    name: "Nestle Sut 3.2% yog'li",
    price: 14000,
    discountPrice: null,
    unit: "dona",
    step: 1,
    image: "https://images.unsplash.com/photo-1563636619-e910ef447558?w=600&h=600&fit=crop",
    categoryId: "sut-mahsulotlari",
    isAvailable: true,
    isPopular: true
  },
  {
    id: 6,
    name: "Tandir noni (Yopgan non)",
    price: 4500,
    discountPrice: null,
    unit: "dona",
    step: 1,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop",
    categoryId: "non-pishiriqlar",
    isAvailable: true,
    isPopular: true
  },
  {
    id: 7,
    name: "Mol Go'shti (Lahm)",
    price: 85000,
    discountPrice: 79000,
    unit: "kg",
    step: 0.5,
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&h=600&fit=crop",
    categoryId: "gosht-baliq",
    isAvailable: true,
    isPopular: true
  },
  {
    id: 8,
    name: "Coca-Cola Classic",
    price: 12000,
    discountPrice: null,
    unit: "dona",
    step: 1,
    image: "https://images.unsplash.com/photo-1622708704852-62391ee8c61e?w=600&h=600&fit=crop",
    categoryId: "ichimliklar",
    isAvailable: true,
    isPopular: true
  },
  {
    id: 9,
    name: "Assorti Shirinliklar",
    price: 55000,
    discountPrice: 48000,
    unit: "dona",
    step: 1,
    image: "https://images.unsplash.com/photo-1582231246107-52f53406ea9b?w=600&h=600&fit=crop",
    categoryId: "shirinliklar",
    isAvailable: true,
    isPopular: false
  },
  {
    id: 10,
    name: "Ariel Kir Yuvish Kukuni",
    price: 38000,
    discountPrice: null,
    unit: "dona",
    step: 1,
    image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&h=600&fit=crop",
    categoryId: "maishiy-tovarlar",
    isAvailable: true,
    isPopular: false
  }
];

export const fetchProducts = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return PRODUCTS;
};

export const fetchProductsByCategory = async (categoryId) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return PRODUCTS.filter(p => p.categoryId === categoryId);
};

export const searchProducts = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const q = query.toLowerCase();
  return PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
};
