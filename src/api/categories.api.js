const CATEGORIES = [
  { id: 'meva-sabzavot', name: 'Meva & Sabzavot', icon: '🍎' },
  { id: 'gosht-baliq', name: 'Go\'sht & Baliq', icon: '🥩' },
  { id: 'sut-mahsulotlari', name: 'Sut mahsulotlari', icon: '🥛' },
  { id: 'non-pishiriqlar', name: 'Non & Pishiriqlar', icon: '🍞' },
  { id: 'ichimliklar', name: 'Ichimliklar', icon: '🥤' },
  { id: 'shirinliklar', name: 'Shirinliklar', icon: '🍫' },
  { id: 'maishiy-tovarlar', name: 'Maishiy tovarlar', icon: '🧼' },
  { id: 'donli-mahsulotlar', name: 'Donli mahsulotlar', icon: '🌾' },
  { id: 'muzlatilgan', name: 'Muzlatilgan', icon: '🧊' },
  { id: 'choy-kofe', name: 'Choy & Kofe', icon: '☕' },
];

export const fetchCategories = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return CATEGORIES;
};
