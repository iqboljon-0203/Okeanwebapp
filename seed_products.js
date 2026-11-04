import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// .env faylini o'qish
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim();
    } else if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=')[1].trim();
    }
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Xatolik: .env faylida VITE_SUPABASE_URL yoki VITE_SUPABASE_ANON_KEY topilmadi!");
  process.exit(1);
}

console.log("🔗 Supabase ulanishi:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
  { id: 'sabzavotlar', name: 'Sabzavotlar', image_url: '/images/categories/sabzavotlar.jpg' },
  { id: 'mevalar', name: 'Mevalar', image_url: '/images/categories/mevalar.jpg' },
  { id: 'ichimliklar', name: 'Ichimliklar', image_url: '/images/categories/ichimliklar.jpg' }
];

const products = [
  // Sabzavotlar
  { name: 'Piyoz', category_id: 'sabzavotlar', price: 4000, discount_price: null, stock: 150, unit: 'kg', step: 1, image_url: '/images/products/piyoz.jpg', is_popular: true },
  { name: 'Sariq sabzi', category_id: 'sabzavotlar', price: 5000, discount_price: null, stock: 120, unit: 'kg', step: 1, image_url: '/images/products/sariq-sabzi.jpg', is_popular: false },
  { name: 'Bodring', category_id: 'sabzavotlar', price: 18000, discount_price: 15000, stock: 80, unit: 'kg', step: 0.5, image_url: '/images/products/bodring.jpg', is_popular: true },
  { name: 'Pomidor', category_id: 'sabzavotlar', price: 22000, discount_price: null, stock: 90, unit: 'kg', step: 0.5, image_url: '/images/products/pomidor.jpg', is_popular: true },
  { name: 'Kartoshka', category_id: 'sabzavotlar', price: 6000, discount_price: null, stock: 200, unit: 'kg', step: 1, image_url: '/images/products/kartoshka.jpg', is_popular: true },

  // Mevalar
  { name: 'Qulupnay', category_id: 'mevalar', price: 45000, discount_price: 40000, stock: 40, unit: 'kg', step: 0.5, image_url: '/images/products/qulupnay.jpg', is_popular: true },
  { name: 'Tarvuz', category_id: 'mevalar', price: 8000, discount_price: null, stock: 60, unit: 'kg', step: 1, image_url: '/images/products/tarvuz.jpg', is_popular: true },
  { name: 'Qizil olma', category_id: 'mevalar', price: 16000, discount_price: null, stock: 100, unit: 'kg', step: 1, image_url: '/images/products/qizil-olma.jpg', is_popular: false },
  { name: 'Apelsin', category_id: 'mevalar', price: 28000, discount_price: 25000, stock: 50, unit: 'kg', step: 1, image_url: '/images/products/apelsin.jpg', is_popular: false },
  { name: 'Banan', category_id: 'mevalar', price: 24000, discount_price: null, stock: 80, unit: 'kg', step: 1, image_url: '/images/products/banan.jpg', is_popular: true },

  // Ichimliklar
  { name: 'Coca-Cola 1.5L', category_id: 'ichimliklar', price: 14000, discount_price: null, stock: 100, unit: 'dona', step: 1, image_url: '/images/products/coca-cola-1-5l.jpg', is_popular: true },
  { name: 'Fanta 1.5L', category_id: 'ichimliklar', price: 14000, discount_price: null, stock: 100, unit: 'dona', step: 1, image_url: '/images/products/fanta-1-5l.jpg', is_popular: true },
  { name: 'Pepsi 1.5L', category_id: 'ichimliklar', price: 13500, discount_price: 12000, stock: 100, unit: 'dona', step: 1, image_url: '/images/products/pepsi-1-5l.jpg', is_popular: true },
  { name: 'Nestle toza suv 1.5L', category_id: 'ichimliklar', price: 5000, discount_price: null, stock: 200, unit: 'dona', step: 1, image_url: '/images/products/nestle-suv-1-5l.jpg', is_popular: false },
  { name: 'Dinay sharbati 1L', category_id: 'ichimliklar', price: 15000, discount_price: null, stock: 75, unit: 'dona', step: 1, image_url: '/images/products/dinay-1l.jpg', is_popular: false }
];

async function seed() {
  let hasError = false;

  console.log("1. Kategoriyalar kiritilmoqda...");
  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'id' });
    if (error) {
      hasError = true;
      console.error(`❌ Kategoriya qo'shishda xatolik (${cat.name}):`, error.message);
    } else {
      console.log(`✅ Kategoriya saqlandi: ${cat.name}`);
    }
  }

  if (hasError) {
    console.log("\n⚠️ Diqqat: Supabase loyihasiga ulanib bo'lmadi.");
    console.log("Agar loyiha Supabase-da 'Paused' holatida bo'lsa:");
    console.log("1. https://supabase.com/dashboard sahifasiga kiring");
    console.log("2. Loyihani tanlang va 'Restore project' tugmasini bosing");
    console.log("3. Qayta tiklangach ushbu buyruqni qayta bajaring: node seed_products.js");
    console.log("Yoki 'seed_products_and_categories.sql' faylidagi kodni Supabase SQL Editor-da ishga tushiring.");
    return;
  }

  console.log("\n2. Mahsulotlar kiritilmoqda...");
  for (const prod of products) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', prod.name)
      .eq('category_id', prod.category_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update(prod)
        .eq('id', existing.id);
      if (error) {
        console.error(`❌ Mahsulotni yangilashda xatolik (${prod.name}):`, error.message);
      } else {
        console.log(`🔄 Mahsulot yangilandi: ${prod.name}`);
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([prod]);
      if (error) {
        console.error(`❌ Mahsulotni qo'shishda xatolik (${prod.name}):`, error.message);
      } else {
        console.log(`✅ Mahsulot qo'shildi: ${prod.name}`);
      }
    }
  }

  console.log("\n🎉 Barcha kategoriya va mahsulotlar muvaffaqiyatli saqlandi!");
}

seed();
