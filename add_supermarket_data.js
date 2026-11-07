import { createClient } from '@supabase/supabase-js';
import https from 'https';

const url = 'https://tpqaxranwoyxiquihtmh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcWF4cmFud295eGlxdWlodG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUzMjEsImV4cCI6MjEwMTIyMTMyMX0.z38BBcWqx36eFk8TtprE2Nlk8_jIJ_v8fxJIdc76NaI';
const supabase = createClient(url, key);

function fetchBuffer(imgUrl) {
  return new Promise((resolve, reject) => {
    https.get(imgUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: status code ${res.statusCode}`));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function uploadToStorage(fileName, imageUrl) {
  try {
    const buffer = await fetchBuffer(imageUrl);
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      console.warn(`Storage upload warning (${fileName}):`, error.message);
      return imageUrl; // Fallback to direct URL if upload fails
    }

    const { data: pubData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return pubData.publicUrl;
  } catch (err) {
    console.warn(`Fetch error for ${fileName}:`, err.message);
    return imageUrl; // Fallback
  }
}

const categories = [
  {
    id: 'sut-mahsulotlari',
    name: 'Sut mahsulotlari',
    storageName: 'cat_sut_mahsulotlari.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'
  },
  {
    id: 'gosht-mahsulotlari',
    name: "Go'sht va kolbasa",
    storageName: 'cat_gosht_mahsulotlari.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop'
  },
  {
    id: 'non-pishiriqlar',
    name: 'Non va pishiriqlar',
    storageName: 'cat_non_pishiriqlar.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'
  },
  {
    id: 'bakaleya',
    name: 'Bakaleya va don',
    storageName: 'cat_bakaleya.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'
  },
  {
    id: 'shirinliklar',
    name: 'Shirinliklar',
    storageName: 'cat_shirinliklar.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop'
  },
  {
    id: 'choy-kofe',
    name: 'Choy va kofe',
    storageName: 'cat_choy_kofe.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop'
  },
  {
    id: 'maishiy-kimyo',
    name: 'Maishiy kimyo',
    storageName: 'cat_maishiy_kimyo.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop'
  }
];

const products = [
  // --- Sut mahsulotlari ---
  {
    name: 'Musaffo Sut 3.2% 1L',
    category_id: 'sut-mahsulotlari',
    price: 12000,
    discount_price: null,
    stock: 80,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_musaffo_sut.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop'
  },
  {
    name: 'Musaffo Qatiq 3.2% 1L',
    category_id: 'sut-mahsulotlari',
    price: 11000,
    discount_price: null,
    stock: 70,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_musaffo_qatiq.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop'
  },
  {
    name: 'Bio Qaymoq 200g',
    category_id: 'sut-mahsulotlari',
    price: 16000,
    discount_price: 14500,
    stock: 50,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_bio_qaymoq.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop'
  },
  {
    name: "President Sariyog' 82.5% 200g",
    category_id: 'sut-mahsulotlari',
    price: 32000,
    discount_price: null,
    stock: 60,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_president_sariyog.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop'
  },
  {
    name: 'Gollandskiy pishloq (Sir) 200g',
    category_id: 'sut-mahsulotlari',
    price: 26000,
    discount_price: null,
    stock: 45,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_sir_holland.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop'
  },
  {
    name: 'Bio Tvorog 9% 250g',
    category_id: 'sut-mahsulotlari',
    price: 14000,
    discount_price: null,
    stock: 40,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_bio_tvorog.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1576186726580-a816e8b12896?w=600&auto=format&fit=crop'
  },

  // --- Go'sht va kolbasa ---
  {
    name: "Mol go'shti (Lahm) 1kg",
    category_id: 'gosht-mahsulotlari',
    price: 98000,
    discount_price: 92000,
    stock: 50,
    unit: 'kg',
    step: 0.5,
    is_popular: true,
    storageName: 'prod_mol_goshti.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&auto=format&fit=crop'
  },
  {
    name: "Qo'y go'shti (Qovurg'a) 1kg",
    category_id: 'gosht-mahsulotlari',
    price: 95000,
    discount_price: null,
    stock: 40,
    unit: 'kg',
    step: 0.5,
    is_popular: true,
    storageName: 'prod_qoy_goshti.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop'
  },
  {
    name: 'Tovuq filesi (Taza) 1kg',
    category_id: 'gosht-mahsulotlari',
    price: 42000,
    discount_price: null,
    stock: 70,
    unit: 'kg',
    step: 0.5,
    is_popular: true,
    storageName: 'prod_tovuq_filesi.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop'
  },
  {
    name: 'Halol Doktorskaya kolbasa 500g',
    category_id: 'gosht-mahsulotlari',
    price: 38000,
    discount_price: null,
    stock: 60,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_doktorskaya_kolbasa.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=600&auto=format&fit=crop'
  },
  {
    name: "Mol go'shtli sosiska 500g",
    category_id: 'gosht-mahsulotlari',
    price: 34000,
    discount_price: 29000,
    stock: 50,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_mol_sosiska.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=600&auto=format&fit=crop'
  },

  // --- Non va pishiriqlar ---
  {
    name: 'Samarqand noni',
    category_id: 'non-pishiriqlar',
    price: 7000,
    discount_price: null,
    stock: 100,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_samarqand_noni.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop'
  },
  {
    name: 'Qolipli non (Buxanka)',
    category_id: 'non-pishiriqlar',
    price: 3500,
    discount_price: null,
    stock: 150,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_buxanka_non.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop'
  },
  {
    name: 'Patir non',
    category_id: 'non-pishiriqlar',
    price: 8000,
    discount_price: null,
    stock: 80,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_patir_non.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'
  },
  {
    name: 'Shokoladli Kruassan',
    category_id: 'non-pishiriqlar',
    price: 12000,
    discount_price: 9900,
    stock: 40,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_kruassan.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop'
  },
  {
    name: 'Yupqa Lavash xamiri (3 dona)',
    category_id: 'non-pishiriqlar',
    price: 6000,
    discount_price: null,
    stock: 90,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_lavash.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop'
  },

  // --- Bakaleya va don ---
  {
    name: "Shchedroe Leto o'simlik yog'i 1L",
    category_id: 'bakaleya',
    price: 18000,
    discount_price: 16500,
    stock: 120,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_shchedroe_leto.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop'
  },
  {
    name: 'Alanga guruch 1kg',
    category_id: 'bakaleya',
    price: 19000,
    discount_price: null,
    stock: 200,
    unit: 'kg',
    step: 1,
    is_popular: true,
    storageName: 'prod_alanga_guruch.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'
  },
  {
    name: 'Lazer guruch (Oshbop) 1kg',
    category_id: 'bakaleya',
    price: 27000,
    discount_price: null,
    stock: 150,
    unit: 'kg',
    step: 1,
    is_popular: true,
    storageName: 'prod_lazer_guruch.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop'
  },
  {
    name: 'Oq shakar 1kg',
    category_id: 'bakaleya',
    price: 13000,
    discount_price: null,
    stock: 250,
    unit: 'kg',
    step: 1,
    is_popular: true,
    storageName: 'prod_oq_shakar.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop'
  },
  {
    name: "Qozog'iston Oliy nav un 2kg",
    category_id: 'bakaleya',
    price: 20000,
    discount_price: null,
    stock: 100,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_qozog_un.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'
  },
  {
    name: 'Makfa makaron (Perya) 400g',
    category_id: 'bakaleya',
    price: 11000,
    discount_price: null,
    stock: 110,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_makfa_makaron.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&auto=format&fit=crop'
  },
  {
    name: 'Tuxum C1 (10 dona)',
    category_id: 'bakaleya',
    price: 16000,
    discount_price: 14500,
    stock: 180,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_tuxum_c1.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop'
  },

  // --- Shirinliklar ---
  {
    name: 'Snickers Super 80g',
    category_id: 'shirinliklar',
    price: 11000,
    discount_price: null,
    stock: 120,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_snickers_super.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop'
  },
  {
    name: 'KitKat 4 finger 41.5g',
    category_id: 'shirinliklar',
    price: 8500,
    discount_price: null,
    stock: 90,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_kitkat.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop'
  },
  {
    name: 'Milka sutli shokolad 90g',
    category_id: 'shirinliklar',
    price: 19000,
    discount_price: 16000,
    stock: 75,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_milka_shokolad.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop'
  },
  {
    name: 'Oreo pechenyesi 95g',
    category_id: 'shirinliklar',
    price: 9000,
    discount_price: null,
    stock: 85,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_oreo_pechenye.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop'
  },
  {
    name: 'Nutella shokolad pastasi 350g',
    category_id: 'shirinliklar',
    price: 45000,
    discount_price: null,
    stock: 40,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_nutella.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop'
  },

  // --- Choy va kofe ---
  {
    name: 'Ahmad Tea English Breakfast 100g',
    category_id: 'choy-kofe',
    price: 24000,
    discount_price: null,
    stock: 70,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_ahmad_tea_qora.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop'
  },
  {
    name: 'Ahmad Tea Yashil choy 100g',
    category_id: 'choy-kofe',
    price: 24000,
    discount_price: null,
    stock: 65,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_ahmad_tea_yashil.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&auto=format&fit=crop'
  },
  {
    name: 'Nescafe Gold qahva 95g',
    category_id: 'choy-kofe',
    price: 49000,
    discount_price: 44000,
    stock: 50,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_nescafe_gold.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop'
  },
  {
    name: 'MacCoffee 3v1 (25 dona qadoqda)',
    category_id: 'choy-kofe',
    price: 38000,
    discount_price: null,
    stock: 60,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_maccoffee.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop'
  },
  {
    name: "Toshkent 95 ko'k choy 100g",
    category_id: 'choy-kofe',
    price: 12000,
    discount_price: null,
    stock: 100,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_toshkent_kok_choy.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop'
  },

  // --- Maishiy kimyo ---
  {
    name: 'Ariel Avtomat kukun 3kg',
    category_id: 'maishiy-kimyo',
    price: 78000,
    discount_price: 69000,
    stock: 40,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_ariel_3kg.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop'
  },
  {
    name: 'Fairy Limon idish yuvish geli 450ml',
    category_id: 'maishiy-kimyo',
    price: 18000,
    discount_price: null,
    stock: 80,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_fairy_limon.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600&auto=format&fit=crop'
  },
  {
    name: 'Head & Shoulders shampun 400ml',
    category_id: 'maishiy-kimyo',
    price: 39000,
    discount_price: null,
    stock: 50,
    unit: 'dona',
    step: 1,
    is_popular: true,
    storageName: 'prod_head_shoulders.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop'
  },
  {
    name: 'Colgate Total 12 tish pastasi 100ml',
    category_id: 'maishiy-kimyo',
    price: 21000,
    discount_price: 18000,
    stock: 70,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_colgate_total.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1559591937-e10323971e42?w=600&auto=format&fit=crop'
  },
  {
    name: 'Domestos tozalovchi gel 1L',
    category_id: 'maishiy-kimyo',
    price: 25000,
    discount_price: null,
    stock: 45,
    unit: 'dona',
    step: 1,
    is_popular: false,
    storageName: 'prod_domestos.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=600&auto=format&fit=crop'
  }
];

async function main() {
  console.log("=== 1. Yangi kategoriyalarni saqlash ===");
  for (const cat of categories) {
    console.log(`Yuklanmoqda: ${cat.name}...`);
    const publicUrl = await uploadToStorage(cat.storageName, cat.sourceUrl);
    
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: cat.id,
        name: cat.name,
        image_url: publicUrl
      }, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Xatolik (${cat.name}):`, error.message);
    } else {
      console.log(`✅ Kategoriya saqlandi: ${cat.name} -> ${publicUrl}`);
    }
  }

  console.log("\n=== 2. Yangi tovarlarni saqlash ===");
  for (const prod of products) {
    console.log(`Yuklanmoqda: ${prod.name}...`);
    const publicUrl = await uploadToStorage(prod.storageName, prod.sourceUrl);

    const payload = {
      name: prod.name,
      category_id: prod.category_id,
      price: prod.price,
      discount_price: prod.discount_price,
      stock: prod.stock,
      unit: prod.unit,
      step: prod.step,
      image_url: publicUrl,
      is_popular: prod.is_popular
    };

    // Tekshirish: nom va kategoriya bo'yicha mavjudmi?
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', prod.name)
      .eq('category_id', prod.category_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', existing.id);
      if (error) console.error(`❌ Yangilashda xato (${prod.name}):`, error.message);
      else console.log(`🔄 Mahsulot yangilandi: ${prod.name}`);
    } else {
      const { error } = await supabase
        .from('products')
        .insert([payload]);
      if (error) console.error(`❌ Qo'shishda xato (${prod.name}):`, error.message);
      else console.log(`✅ Mahsulot qo'shildi: ${prod.name}`);
    }
  }

  console.log("\n🎉 Barcha supermarket kategoriyalari va mahsulotlari muvaffaqiyatli yuklandi!");
}

main();

