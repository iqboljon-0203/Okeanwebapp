import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tag, Info, Bell } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Buyurtma tasdiqlandi',
      message: '№1234 raqamli buyurtmangiz qabul qilindi va tez orada yetkaziladi.',
      time: '14:30',
      date: 'Bugun',
      read: false
    },
    {
      id: 2,
      type: 'promo',
      title: 'Dam olish kunlari aksiyasi!',
      message: 'Shanba va Yakshanba kunlari barcha mevalarga 20% chegirma.',
      time: '10:00',
      date: 'Kecha',
      read: true
    },
    {
      id: 3,
      type: 'order',
      title: 'Buyurtma yetkazildi',
      message: '№1230 raqamli buyurtmangiz muvaffaqiyatli yetkazildi. Xaridingiz uchun rahmat!',
      time: '18:45',
      date: '19 Yan',
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'Ilova yangilandi',
      message: 'Biz ilovani yanada tezroq va qulayroq qildik. Yangi imkoniyatlarni sinab ko\'ring.',
      time: '09:15',
      date: '18 Yan',
      read: true
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={24} color="#FF6B00" />;
      case 'promo': return <Tag size={24} color="#FF4B3A" />;
      case 'system': return <Info size={24} color="#4facfe" />;
      default: return <Bell size={24} color="#00302D" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'order': return '#FFF5E6';
      case 'promo': return '#FFF5F4';
      case 'system': return '#EBF5FF';
      default: return '#F1F4F5';
    }
  };

  return (
    <div className="notifications-page animate-up">
      <div className="page-header sticky-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Bildirishnomalar</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="page-container">
        <div className="notifications-list">
          {notifications.map((item) => (
            <div key={item.id} className={`notification-card ${!item.read ? 'unread' : ''}`}>
              <div className="icon-box" style={{ background: getBgColor(item.type) }}>
                {getIcon(item.type)}
                {!item.read && <div className="dot"></div>}
              </div>
              <div className="content">
                <div className="header">
                  <h3>{item.title}</h3>
                  <span className="time">{item.date}, {item.time}</span>
                </div>
                <p>{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
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
        .page-header h2 {
          font-size: 18px;
          font-weight: 800;
          color: var(--secondary);
        }
        .back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #F1F4F5;
          color: var(--text-muted);
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 10px 0;
        }

        .notification-card {
          background: #fff;
          border-radius: 20px;
          padding: 16px;
          display: flex;
          gap: 15px;
          align-items: flex-start;
          transition: all 0.2s;
        }

        .notification-card.unread {
          background: #fff;
          box-shadow: 0 4px 20px rgba(255, 75, 58, 0.08);
          border: 1px solid rgba(255, 75, 58, 0.1);
        }

        .icon-box {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: var(--primary);
          border: 2px solid #fff;
          border-radius: 50%;
        }

        .content {
          flex: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }

        .header h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--secondary);
          line-height: 1.3;
        }

        .time {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
          margin-left: 10px;
        }

        .content p {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
