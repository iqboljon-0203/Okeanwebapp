import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = 'https://tpqaxranwoyxiquihtmh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcWF4cmFud295eGlxdWlodG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUzMjEsImV4cCI6MjEwMTIyMTMyMX0.z38BBcWqx36eFk8TtprE2Nlk8_jIJ_v8fxJIdc76NaI';
const supabase = createClient(url, key);

const categoryUploads = [
  { id: 'sabzavotlar', localPath: 'public/images/categories/sabzavotlar.jpg', storageName: 'cat_sabzavotlar.jpg' },
  { id: 'mevalar', localPath: 'public/images/categories/mevalar.jpg', storageName: 'cat_mevalar.jpg' },
  { id: 'ichimliklar', localPath: 'public/images/categories/ichimliklar.jpg', storageName: 'cat_ichimliklar.jpg' }
];

const productUploads = [
  { id: 7, name: 'Piyoz', localPath: 'public/images/products/piyoz.jpg', storageName: 'prod_piyoz.jpg' },
  { id: 8, name: 'Sariq sabzi', localPath: 'public/images/products/sariq-sabzi.jpg', storageName: 'prod_sariq_sabzi.jpg' },
  { id: 9, name: 'Bodring', localPath: 'public/images/products/bodring.jpg', storageName: 'prod_bodring.jpg' },
  { id: 10, name: 'Pomidor', localPath: 'public/images/products/pomidor.jpg', storageName: 'prod_pomidor.jpg' },
  { id: 11, name: 'Kartoshka', localPath: 'public/images/products/kartoshka.jpg', storageName: 'prod_kartoshka.jpg' },
  { id: 12, name: 'Qulupnay', localPath: 'public/images/products/qulupnay.jpg', storageName: 'prod_qulupnay.jpg' },
  { id: 13, name: 'Tarvuz', localPath: 'public/images/products/tarvuz.jpg', storageName: 'prod_tarvuz.jpg' },
  { id: 14, name: 'Qizil olma', localPath: 'public/images/products/qizil-olma.jpg', storageName: 'prod_qizil_olma.jpg' },
  { id: 15, name: 'Apelsin', localPath: 'public/images/products/apelsin.jpg', storageName: 'prod_apelsin.jpg' },
  { id: 2, name: 'Banan', localPath: 'public/images/products/banan.jpg', storageName: 'prod_banan.jpg' },
  { id: 16, name: 'Coca-Cola 1.5L', localPath: 'public/images/products/coca-cola-1-5l.jpg', storageName: 'prod_coca_cola_1_5l.jpg' },
  { id: 17, name: 'Fanta 1.5L', localPath: 'public/images/products/fanta-1-5l.jpg', storageName: 'prod_fanta_1_5l.jpg' },
  { id: 18, name: 'Pepsi 1.5L', localPath: 'public/images/products/pepsi-1-5l.jpg', storageName: 'prod_pepsi_1_5l.jpg' },
  { id: 19, name: 'Nestle toza suv 1.5L', localPath: 'public/images/products/nestle-suv-1-5l.jpg', storageName: 'prod_nestle_suv_1_5l.jpg' },
  { id: 20, name: 'Dinay sharbati 1L', localPath: 'public/images/products/dinay-1l.jpg', storageName: 'prod_dinay_1l.jpg' }
];

async function run() {
  console.log("=== 1. Kategoriyalar rasmlarini yuklash va bazani yangilash ===");
  for (const cat of categoryUploads) {
    if (!fs.existsSync(cat.localPath)) {
      console.error(`Fayl topilmadi: ${cat.localPath}`);
      continue;
    }
    const buffer = fs.readFileSync(cat.localPath);
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(cat.storageName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (upErr) {
      console.error(`Yuklashda xato (${cat.id}):`, upErr.message);
      continue;
    }

    const { data: pubData } = supabase.storage
      .from('product-images')
      .getPublicUrl(cat.storageName);

    const publicUrl = pubData.publicUrl;
    console.log(`✅ [Kategoriya] ${cat.id} yuklandi: ${publicUrl}`);

    const { error: dbErr } = await supabase
      .from('categories')
      .update({ image_url: publicUrl })
      .eq('id', cat.id);

    if (dbErr) {
      console.error(`Bazani yangilashda xato (${cat.id}):`, dbErr.message);
    } else {
      console.log(`  -> Kategoriya bazada yangilandi: ${cat.id}`);
    }
  }

  console.log("\n=== 2. Mahsulotlar rasmlarini yuklash va bazani yangilash ===");
  for (const prod of productUploads) {
    if (!fs.existsSync(prod.localPath)) {
      console.error(`Fayl topilmadi: ${prod.localPath}`);
      continue;
    }
    const buffer = fs.readFileSync(prod.localPath);
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(prod.storageName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (upErr) {
      console.error(`Yuklashda xato (${prod.name}):`, upErr.message);
      continue;
    }

    const { data: pubData } = supabase.storage
      .from('product-images')
      .getPublicUrl(prod.storageName);

    const publicUrl = pubData.publicUrl;
    console.log(`✅ [Mahsulot] ${prod.name} yuklandi: ${publicUrl}`);

    const { error: dbErr } = await supabase
      .from('products')
      .update({ image_url: publicUrl })
      .eq('id', prod.id);

    if (dbErr) {
      console.error(`Bazani yangilashda xato (${prod.name}):`, dbErr.message);
    } else {
      console.log(`  -> Mahsulot bazada yangilandi: ${prod.name}`);
    }
  }

  console.log("\n🎉 Barcha rasmlar Supabase Storage-ga yuklandi va bazadagi linklar to'liq yangilandi!");
}

run();

