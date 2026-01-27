import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp, Phone } from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'Buyurtma qancha vaqtda yetkaziladi?', a: 'Bizning standart yetkazib berish vaqtimiz 30 daqiqadan 60 daqiqagacha. Tirbandliklarga qarab o\'zgarishi mumkin.' },
    { q: 'To\'lov turlari qanday?', a: 'Siz naqd pul, Click, Payme yoki karta orqali to\'lashingiz mumkin.' },
    { q: 'Buyurtmani bekor qilsam bo\'ladimi?', a: 'Ha, agar buyurtma hali "Yo\'lga chiqdi" maqomiga o\'tmagan bo\'lsa, uni bekor qilishingiz mumkin.' },
    { q: 'Minimal buyurtma summasi bormi?', a: 'Ha, minimal buyurtma summasi 30,000 so\'m.' },
  ];

  return (
    <div className="help-page animate-up">
      <div className="page-header sticky-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Yordam markazi</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="page-container">
        <div className="support-card shadow">
          <div className="icon-wrapper">
            <MessageCircle size={32} color="#fff" />
          </div>
          <h3>Savolingiz bormi?</h3>
          <p>Bizning operatorlarimiz 24/7 aloqada. Har qanday savol bilan murojaat qilishingiz mumkin.</p>
          <a href="https://t.me/musulman_0201" target="_blank" rel="noopener noreferrer" className="contact-btn">
            <MessageCircle size={20} /> Adminga yozish
          </a>
          <a href="tel:+998552010501" className="phone-btn">
            <Phone size={20} /> +998 55-201-05-01
          </a>
        </div>

        <h3 className="section-title">Ko'p beriladigan savollar</h3>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item shadow-sm ${openIndex === index ? 'open' : ''}`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="faq-header">
                <span className="question">{faq.q}</span>
                {openIndex === index ? <ChevronUp size={20} color="#7A869A" /> : <ChevronDown size={20} color="#7A869A" />}
              </div>
              {openIndex === index && (
                <div className="faq-body animate-fade-in">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
        
        .support-card {
          background: var(--primary-gradient);
          border-radius: 24px;
          padding: 24px;
          color: #fff;
          text-align: center;
          margin-bottom: 30px;
        }
        .icon-wrapper {
          width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;
        }
        .support-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .support-card p { font-size: 14px; opacity: 0.9; margin-bottom: 20px; line-height: 1.4; }
        
        .contact-btn, .phone-btn {
          width: 100%; padding: 14px; border-radius: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 10px;
        }
        .contact-btn { background: #fff; color: var(--primary); }
        .phone-btn { background: rgba(255,255,255,0.15); color: #fff; margin-bottom: 0; }
        
        .section-title { font-size: 18px; font-weight: 800; color: var(--secondary); margin-bottom: 15px; }
        
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: #fff; border-radius: 16px; overflow: hidden; }
        .faq-header {
          padding: 16px; display: flex; justify-content: space-between; align-items: center;
          cursor: pointer;
        }
        .question { font-weight: 600; color: var(--secondary); font-size: 15px; }
        .faq-body { padding: 0 16px 16px 16px; color: var(--text-muted); font-size: 14px; line-height: 1.5; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
};

export default Help;
