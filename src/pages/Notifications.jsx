import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tag, Info, Bell, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    if (!user?.telegramId) return;

    const subscription = supabase
        .channel('public:orders:user')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'orders',
            filter: `user_id=eq.${user.telegramId}`
        }, () => {
            fetchNotifications();
        })
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.telegramId) {
        setLoading(false);
        return;
    }

    try {
        // Fetch User Orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.telegramId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform orders into notifications
        const notifs = (orders || []).map(order => {
            let title = 'Buyurtma holati';
            let message = '';
            let type = 'system';
            let isUnread = false; // Simple logic: if status is 'new' consider it unread/active

            switch (order.status) {
                case 'new':
                    title = 'Buyurtma qabul qilindi';
                    message = `№${order.id} raqamli buyurtmangiz qabul qilindi va tez orada ko'rib chiqiladi.`;
                    type = 'order';
                    isUnread = true;
                    break;
                case 'pending':
                    title = 'Buyurtma tasdiqlandi';
                    message = `№${order.id} raqamli buyurtmangiz tasdiqlandi va yetkazib berishga tayyorlanmoqda.`;
                    type = 'order';
                    break;
                case 'delivered':
                    title = 'Buyurtma yetkazildi';
                    message = `№${order.id} raqamli buyurtmangiz muvaffaqiyatli yetkazildi. Xaridingiz uchun rahmat!`;
                    type = 'order';
                    break;
                case 'canceled':
                    title = 'Buyurtma bekor qilindi';
                    message = `№${order.id} raqamli buyurtmangiz bekor qilindi.`;
                    type = 'system'; // different color maybe
                    break;
                default:
                    message = `№${order.id} raqamli buyurtma holati: ${order.status}`;
            }

            const dateObj = new Date(order.created_at);
            const isToday = dateObj.toLocaleDateString() === new Date().toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
                id: order.id,
                type,
                title,
                message,
                time: timeStr,
                date: isToday ? 'Bugun' : dateObj.toLocaleDateString(),
                read: !isUnread
            };
        });

        // Optional: Add static promo notifications here if needed in future
        setNotifications(notifs);

    } catch (error) {
        console.error("Error fetching notifications:", error);
    } finally {
        setLoading(false);
    }
  };

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
        {loading ? (
            <div className="loading-state">
                <Loader2 className="spin" size={30} color="var(--primary)" />
            </div>
        ) : notifications.length === 0 ? (
            <div className="empty-state">
                <Bell size={48} color="#ddd" />
                <p>Bildirishnomalar yo'q</p>
            </div>
        ) : (
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
        )}
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

        .loading-state, .empty-state {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 50px 0; color: #aaa; gap: 10px;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Notifications;
