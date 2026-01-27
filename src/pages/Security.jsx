import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Lock, X } from 'lucide-react';

const Security = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    { 
      id: 1, 
      icon: <FileText size={24} color="#4facfe" />, 
      title: 'Foydalanish shartlari', 
      desc: 'Ilovadan foydalanish qoidalari va shartlari',
      content: `1. UMUMIY QOIDALAR
1.1. Ushbu Foydalanish shartlari (keyingi o‘rinlarda "Shartlar") siz (keyingi o‘rinlarda "Foydalanuvchi") va Okean Market (keyingi o‘rinlarda "Platforma") o‘rtasidagi munosabatlarni tartibga soladi.
1.2. Ilovadan foydalanish orqali siz ushbu shartlarga to‘liq rozi bo‘lasiz.

2. XIZMATLAR KO‘RSATISH
2.1. Platforma foydalanuvchilarga mahsulotlarni onlayn buyurtma qilish va yetkazib berish xizmatini taklif etadi.
2.2. Buyurtma berish 24/7 rejimida amalga oshiriladi, yetkazib berish esa belgilangan ish vaqtlarida bajariladi.

3. FOYDALANUVCHI MAJBURIYATLARI
3.1. Ro‘yxatdan o‘tishda to‘g‘ri va aniq ma’lumotlarni taqdim etish.
3.2. Ilovadan noqonuniy maqsadlarda foydalanmaslik.`
    },
    { 
      id: 2, 
      icon: <Lock size={24} color="#00b894" />, 
      title: 'Maxfiylik siyosati', 
      desc: 'Ma\'lumotlaringiz himoyasi va xavfsizligi',
      content: `1. MA'LUMOTLARNI YIG'ISH
1.1. Biz sizning ismingiz, telefon raqamingiz va manzilingizni buyurtmalarni bajarish maqsadi uchun yig'amiz.
1.2. Telefon raqamingiz faqat siz bilan bog'lanish va buyurtma holati haqida xabar berish uchun ishlatiladi.

2. MA'LUMOTLARNI HIMOYA QILISH
2.1. Biz sizning shaxsiy ma'lumotlaringizni uchinchi shaxslarga bermaymiz, qonunchilikda belgilangan hollar bundan mustasno.
2.2. Ma'lumotlar shifrlangan holda xavfsiz serverlarda saqlanadi.

3. COOKIES VA TEXNIK MA'LUMOTLAR
3.1. Ilova ishlashini yaxshilash uchun biz texnik ma'lumotlarni (qurilma turi, IP manzil) yig'ishimiz mumkin.`
    },
    { 
      id: 3, 
      icon: <ShieldCheck size={24} color="#FFD700" />, 
      title: 'Litsenziya', 
      desc: 'Dasturiy ta\'minot litsenziyasi',
      content: `Okean Market litsenziyasi.
Versiya: 1.0.0
Litsenziya raqami: OM-2026-X789

Ushbu dasturiy ta'minot mualliflik huquqi bilan himoyalangan. Nusxalash, o'zgartirish yoki ruxsatsiz tarqatish taqiqlanadi.

© 2026 Okean Market LLC.`
    },
  ];

  return (
    <div className="security-page animate-up">
      <div className="page-header sticky-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Xavfsizlik</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="page-container">
        <div className="security-list">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="security-card shadow-sm"
              onClick={() => setSelectedItem(item)}
            >
              <div className="icon-box">
                {item.icon}
              </div>
              <div className="content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="security-footer">
          <p>Versiya 1.0.0</p>
          <p>© 2026 Okean Market. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>

      {/* Info Modal using Portal */}
      {selectedItem && createPortal(
        <div className="portal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="portal-content animate-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.title}</h3>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <pre>{selectedItem.content}</pre>
            </div>
            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
              Tushundim
            </button>
          </div>
          <style jsx>{`
            .portal-overlay {
              position: fixed; top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.5); 
              z-index: 99999; /* Max Z-Index Global */
              display: flex; align-items: flex-end; backdrop-filter: blur(4px);
            }
            .portal-content {
              background: #fff; width: 100%; border-radius: 24px 24px 0 0;
              padding: 24px 24px 40px 24px; /* Sufficient padding for button */
              max-height: 85vh; display: flex; flex-direction: column;
              animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .modal-header {
              display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
            }
            .modal-header h3 { font-size: 20px; font-weight: 800; color: var(--secondary); margin: 0; }
            .close-btn { 
              color: var(--text-muted); background: #f2f2f2; border-radius: 50%; width: 32px; height: 32px;
              display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;
            }
            
            .modal-body {
              flex: 1; overflow-y: auto; margin-bottom: 20px;
              background: #F8F9FA; padding: 16px; border-radius: 16px;
            }
            .modal-body pre {
              white-space: pre-wrap; font-family: 'Outfit', sans-serif;
              font-size: 14px; line-height: 1.6; color: var(--text-muted);
            }
            
            .modal-close-btn {
              width: 100%; padding: 16px; background: var(--primary);
              color: #fff; border-radius: 16px; font-weight: 700; font-size: 16px;
              box-shadow: 0 4px 15px rgba(255, 75, 58, 0.3); border: none; cursor: pointer;
            }

            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>,
        document.body
      )}

      <style>{`
        .page-header {
          padding: 15px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .page-header h2 { font-size: 18px; font-weight: 800; color: var(--secondary); }
        .back-btn {
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          border-radius: 12px; background: #F1F4F5; color: var(--text-muted);
        }
        
        .security-list { display: flex; flex-direction: column; gap: 15px; padding: 10px 0; }
        
        .security-card {
          background: #fff; border-radius: 20px; padding: 16px; display: flex; gap: 15px; align-items: center;
          cursor: pointer;
        }
        .security-card:active { transform: scale(0.98); }
        
        .icon-box {
          width: 50px; height: 50px; border-radius: 16px; background: #F8F9FA;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .content { flex: 1; }
        .content h3 { font-size: 16px; font-weight: 700; color: var(--secondary); margin-bottom: 4px; }
        .content p { font-size: 13px; color: var(--text-muted); line-height: 1.3; }

        .security-footer {
          margin-top: 40px; text-align: center; color: var(--text-muted); font-size: 12px;
        }
        .security-footer p { margin-bottom: 5px; }
      `}</style>
    </div>
  );
};

export default Security;
