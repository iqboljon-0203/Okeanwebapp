import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { fetchAvailableOrders, acceptOrder, fetchMyActiveOrder, completeOrder, fetchCourierHistory } from '../api/courier.api';
import { 
  Package, CheckCircle, Navigation, Phone, 
  MapPin, RefreshCw, ArrowRight, User, 
  LogOut, Settings, ChevronRight, Calculator, Star,
  ClipboardList, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import CourierBottomNav from '../components/CourierBottomNav';

const Courier = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('pool'); // pool | active
  const [activeView, setActiveView] = useState('home'); // home | history | profile
  
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // FORCE GET ID if missing
  useEffect(() => {
      const ensureUserId = async () => {
          if (!user) return;

          // 1. Try to fetch by Telegram ID
          if (!user.id && user.telegramId) {
              console.log("User ID missing, fetching from DB using telegram_id...", user.telegramId);
              const { data, error } = await supabase.from('profiles').select('*').eq('telegram_id', user.telegramId).maybeSingle();
              
              if (error) {
                  console.error("Error fetching profile for ID:", error);
              }
              
              if (data) {
                  console.log("Fetched Profile Data:", data);
                  if (data.id) {
                      user.id = data.id;
                      // Persist if found
                      // setStorageItem('user', user); 
                  } else {
                      console.error("CRITICAL: Profile found but ID is NULL/UNDEFINED", data);
                  }
                  return;
              } else {
                   console.log("No profile data returned for this Telegram ID.");
              }
          }

          // 2. DEV MODE Fallback: Just grab the first courier profile found OR CREATE ONE
          if ((!user.id) && import.meta.env.DEV) {
             console.log("DEV MODE: Fetching ANY courier profile...");
             const { data } = await supabase.from('profiles').select('id, telegram_id').eq('role', 'courier').limit(1).maybeSingle();
             
             if (data) {
                 console.log("DEV: Assigned Existing Courier ID:", data.id);
                 user.id = data.id;
             } else {
                 console.log("DEV: No courier found, CREATING 'Test Courier'...");
                 const { data: newCourier, error } = await supabase.from('profiles').insert([{
                     telegram_id: Math.floor(Math.random() * 1000000000), // Random ID
                     full_name: 'Test Courier',
                     role: 'courier',
                     phone_number: '+998901234567'
                 }]).select().single();
                 
                 if (newCourier) {
                     console.log("DEV: Created Test Courier:", newCourier.id);
                     user.id = newCourier.id;
                 } else {
                     console.error("Failed to create test courier:", error);
                 }
             }
          }
      };
      
      ensureUserId();
  }, [user]);

  useEffect(() => {
    if (activeView === 'home') {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    } else if (activeView === 'history' || activeView === 'profile') {
        loadHistory();
    }
  }, [user, activeView]);

  // ... (loadHistory functions remain same)

// ...

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const data = await fetchCourierHistory(user.id);
        setHistoryOrders(data || []);
    } catch (err) {
        console.error(err);
        toast.error('Tarixni yuklashda xatolik');
    } finally {
        setLoading(false);
    }
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const myOrder = await fetchMyActiveOrder(user.id);
      if (myOrder) {
        setActiveOrder(myOrder);
        setActiveTab('active');
      } else {
        setActiveOrder(null);
        if (activeTab === 'active') setActiveTab('pool');
        const pool = await fetchAvailableOrders();
        setOrders(pool || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
    toast.success('Yangilandi');
  };

  const handleAccept = async (orderId) => {
    setLoadingAction(true);
    try {
      const courierId = user.id; 
      if (!courierId) {
        toast.error('Kuryer ID aniqlanmadi');
        return;
      }
      await acceptOrder(orderId, courierId);
      toast.success('Buyurtma qabul qilindi!');
      await loadData();
    } catch (err) {
      toast.error('Buyurtmani qabul qilib bo\'lmadi');
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleComplete = async (orderId) => {
    if (!confirm('Haqiqatan ham buyurtmani yetkazdingizmi?')) return;
    setLoadingAction(true);
    try {
      await completeOrder(orderId);
      toast.success('Buyurtma yopildi ✅');
      setActiveOrder(null);
      setActiveTab('pool');
      await loadData();
    } catch (err) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoadingAction(false);
    }
  };

  const openMap = (order) => {
    if (!order) return;
    
    // DB da location_lat/long bo'lishi mumkin, yoki biz mapping qilgan bo'lsak lat/lng
    const lat = order.lat || order.location_lat;
    const lng = order.lng || order.location_long;
    const address = order.address_text;
    
    if (lat && lng) {
      // pt={lng},{lat},pm2rdm (qizil marker)
      // ll={lng},{lat} (markazlashtirish)
      window.open(`https://yandex.com/maps/?ll=${lng},${lat}&pt=${lng},${lat},pm2rdm&z=17&l=map`, '_blank');
    } else if (address) {
      window.open(`https://yandex.com/maps/?text=${encodeURIComponent(address)}`, '_blank');
    } else {
      toast.error('Manzil ma\'lumotlari yo\'q');
    }
  };

// ...

                                <button 
                                    className="map-btn"
                                    onClick={() => openMap(activeOrder)}
                                >
                                    <Navigation size={18} />
                                    Haritada ko'rish
                                </button>



  const handleLogout = () => {
    if (confirm("Haqiqatan ham chiqmoqchimisiz?")) {
        logout();
    }
  };

  if (!user) return <div className="loading-screen">Tizimga kirilmagan</div>;

  return (
    <div className="courier-page animate-up">
      
      {/* VIEW: HOME */}
      {activeView === 'home' && (
        <>
            {/* Header */}
            <div className="courier-header">
                <div className="header-top">
                <div>
                    <h1>Kuryer Paneli</h1>
                    <p>Xush kelibsiz, {user.first_name || 'Kuryer'}</p>
                </div>
                <button className="refresh-btn" onClick={handleRefresh}>
                    <RefreshCw size={20} className={loading ? 'spin' : ''} />
                </button>
                </div>

                <div className="tab-control">
                <button 
                    className={`tab-btn ${activeTab === 'pool' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pool')}
                >
                    <Package size={18} />
                    Yangi ({orders.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'active' ? 'active warning' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    <Navigation size={18} />
                    Faol ({activeOrder ? 1 : 0})
                </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-area">
                
                {/* TAB 1: NEW ORDERS */}
                {activeTab === 'pool' && (
                <div className="orders-list">
                    {orders.length === 0 && !loading ? (
                    <div className="empty-state">
                        <div className="icon-circle">
                        <Package size={32} />
                        </div>
                        <h3>Buyurtmalar yo'q</h3>
                        <p>Hozircha yangi buyurtmalar kelib tushmadi</p>
                    </div>
                    ) : (
                    orders.map(order => (
                        <div key={order.id} className="order-card p-4">
                        <div className="card-badge">Yangi</div>
                        
                        <div className="card-header-row">
                            <div className="id-box">#{order.id.toString().slice(-3)}</div>
                            <div className="id-info">
                            <span className="label">Buyurtma ID</span>
                            <span className="value">#{order.id.toString().slice(0,8)}</span>
                            </div>
                        </div>
                        
                        <div className="info-row">
                            <div className="icon"><MapPin size={16} /></div>
                            <div className="text">
                            <span className="label">MANZIL</span>
                            <span className="value address">{order.address_text || "Manzil ko'rsatilmagan"}</span>
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="icon green"><CheckCircle size={16} /></div>
                            <div className="text">
                            <span className="label">SUMMA</span>
                            <span className="value price">{(order.total_price || 0).toLocaleString()} <small>so'm</small></span>
                            </div>
                        </div>

                        <button 
                            className="action-btn black"
                            onClick={() => handleAccept(order.id)}
                            disabled={loadingAction}
                        >
                            {loadingAction ? '...' : <>Qabul qilish <ArrowRight size={18} /></>}
                        </button>
                        </div>
                    ))
                    )}
                </div>
                )}

                {/* TAB 2: ACTIVE ORDER */}
                {activeTab === 'active' && (
                <div className="active-order-view">
                    {!activeOrder ? (
                        <div className="empty-state">
                            <div className="icon-circle orange">
                                <CheckCircle size={32} />
                            </div>
                            <h3>Faol buyurtma yo'q</h3>
                            <p>Yangi buyurtmalarni qabul qiling</p>
                        </div>
                    ) : (
                        <>
                        {/* Map Card */}
                        <div className="map-card">
                            <div className="map-placeholder">
                                <MapPin size={40} className="pin-bounce" />
                                <span>GEO-JOYLASHUV</span>
                            </div>
                            <div className="map-content">
                                <div className="address-block">
                                    <span className="label">MOLJAL</span>
                                    <span className="value">{activeOrder.address_text}</span>
                                </div>
                                <button 
                                    className="map-btn"
                                    onClick={() => openMap(activeOrder)}
                                >
                                    <Navigation size={18} />
                                    Haritada ko'rish
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="action-buttons">
                            <a href={`tel:${(activeOrder.phone || activeOrder.customer_phone || '').replace(/\s+/g, '')}`} className="call-btn">
                                <Phone size={20} />
                                <span>Mijozga qo'ng'iroq</span>
                            </a>
                            
                            <div className="order-summary">
                                Custom Name: <b>{activeOrder.customer_name}</b> <br/>
                                Jami: <b>{(activeOrder.total_price || 0).toLocaleString()} sum</b>
                            </div>

                            <button 
                                className="complete-btn"
                                onClick={() => handleComplete(activeOrder.id)}
                                disabled={loadingAction}
                            >
                                <CheckCircle size={22} />
                                BUYURTMA YETKAZILDI
                            </button>
                        </div>
                        </>
                    )}
                </div>
                )}
            </div>
        </>
      )}

      {/* VIEW: HISTORY */}
      {activeView === 'history' && (
        <div className="content-area pt-20">
            {/* Summary Container */}
            <div className="summary-container">
                <h2 className="section-title">Hisobot</h2>
                
                {/* Summary Cards */}
                <div className="summary-grid">
                    <div className="summary-card violet">
                        <div className="s-icon"><Calculator size={22} /></div>
                        <div className="s-info">
                            <span>Jami summa</span>
                            <b>{historyOrders.reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString()}</b>
                        </div>
                    </div>
                    <div className="summary-card orange">
                        <div className="s-icon"><CheckCircle size={22} /></div>
                        <div className="s-info">
                            <span>Buyurtmalar</span>
                            <b>{historyOrders.length} ta</b>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="section-subtitle">Tarix</h3>

            {loading ? (
                <div className="text-center p-10"><RefreshCw className="spin mx-auto text-gray-400" size={30} /></div>
            ) : historyOrders.length === 0 ? (
                <div className="empty-history">
                    <div className="big-icon-circle">
                       <ClipboardList size={40} />
                    </div>
                    <h3>Tarix topilmadi</h3>
                    <p>Yetkazilgan buyurtmalar shu yerda ko'rinadi</p>
                </div>
            ) : (
                <div className="history-list">
                    {(() => {
                        const grouped = {};
                        historyOrders.forEach(order => {
                            const date = new Date(order.delivered_at || order.created_at).toLocaleDateString('uz-UZ');
                            const today = new Date().toLocaleDateString('uz-UZ');
                            const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('uz-UZ');
                            
                            let label = date;
                            if (date === today) label = "Bugun";
                            else if (date === yesterday) label = "Kecha";
                            
                            if (!grouped[label]) grouped[label] = [];
                            grouped[label].push(order);
                        });

                        return Object.entries(grouped).map(([label, list]) => (
                            <div key={label} className="history-group">
                                <div className="history-date-label">{label}</div>
                                {list.map(order => (
                                    <div key={order.id} className="history-card">
                                        <div className="h-left">
                                            <div className="h-icon">
                                                <CheckCircle size={18} />
                                            </div>
                                            <div className="h-details">
                                                <h4>Order #{order.id.toString().slice(-4)}</h4>
                                                <span>{new Date(order.delivered_at || order.created_at).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                        <div className="h-right">
                                            +{(order.total_price || 0).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ));
                    })()}
                </div>
            )}
        </div>
      )}

      {/* VIEW: PROFILE */}
      {activeView === 'profile' && (
        <div className="content-area pt-20">
             <div className="courier-profile-card">
                 <div className="avatar-circle">{user.first_name?.[0]}</div>
                 <h3>{user.first_name} {user.last_name}</h3>
                 <p className="role-batch">Kuryer</p>
                 
                 <div className="stats-row">
                     <div className="stat-item">
                         <div className="stat-icon bg-green-100 text-green-600">
                             <CheckCircle size={20} />
                         </div>
                         <b>{historyOrders.length}</b>
                         <span>Yetkazildi</span>
                     </div>
                     <div className="stat-item">
                         <div className="stat-icon bg-yellow-100 text-yellow-600">
                             <Star size={20} fill="currentColor" />
                         </div>
                         <b>5.0</b>
                         <span>Reyting</span>
                     </div>
                     <div className="stat-item">
                         <div className="stat-icon bg-blue-100 text-blue-600">
                             <Calculator size={20} />
                         </div>
                         <b>{historyOrders.reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString()}</b>
                         <span>Balans</span>
                     </div>
                 </div>
             </div>

             <div className="profile-menu">
                 <button className="menu-item" onClick={() => setActiveView('settings')}>
                     <div className="menu-icon"><Settings size={20} /></div>
                     <span>Sozlamalar</span>
                     <ChevronRight size={16} className="arrow" />
                 </button>
                 <button className="menu-item" onClick={() => setActiveView('support')}>
                     <div className="menu-icon"><Phone size={20} /></div>
                     <span>Qo'llab-quvvatlash</span>
                     <ChevronRight size={16} className="arrow" />
                 </button>
             </div>

             <button className="logout-btn" onClick={handleLogout}>
                 <LogOut size={20} />
                 Chiqish
             </button>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeView === 'settings' && (
        <div className="content-area pt-20 animate-up">
            <div className="sub-header">
                <button onClick={() => setActiveView('profile')} className="back-btn">
                    <ChevronRight size={24} className="rotate-180" />
                </button>
                <h2>Sozlamalar</h2>
            </div>

            <div className="settings-list">
                <div className="setting-item">
                    <div className="set-icon"><span className="emoji">🇺🇿</span></div>
                    <div className="set-info">
                        <h4>Til</h4>
                        <p>O'zbekcha</p>
                    </div>
                </div>
                <div className="setting-item">
                    <div className="set-icon blue"><Bell size={20} /></div>
                    <div className="set-info">
                        <h4>Bildirishnomalar</h4>
                        <p>Yoqilgan</p>
                    </div>
                    <div className="switch active"></div>
                </div>
            </div>
        </div>
      )}

      {/* VIEW: SUPPORT */}
      {activeView === 'support' && (
        <div className="content-area pt-20 animate-up">
            <div className="sub-header">
                <button onClick={() => setActiveView('profile')} className="back-btn">
                    <ChevronRight size={24} className="rotate-180" />
                </button>
                <h2>Qo'llab-quvvatlash</h2>
            </div>
            
            <div className="support-card text-center mb-6">
                <div className="icon-circle orange mb-3 mx-auto">
                    <Phone size={30} />
                </div>
                <h3>Biz bilan bog'lanish</h3>
                <p className="text-gray-500 text-sm mb-4">Savollaringiz bormi? Bizga qo'ng'iroq qiling yoki yozing.</p>
                <a href="tel:+998901234567" className="action-btn black mb-3">
                    <Phone size={18} /> +998 90 123 45 67
                </a>
                <a href="https://t.me/okean_support" target="_blank" className="action-btn" style={{background:'#0088cc', color:'#fff'}}>
                     Telegram orqali yozish
                </a>
            </div>

            <h3 className="section-title">Ko'p so'raladigan savollar</h3>
            <div className="faq-list">
                <div className="faq-item">
                     <h4>Buyurtmani qanday qabul qilaman?</h4>
                     <p>Yangi buyurtmalar bo'limiga o'ting va "Qabul qilish" tugmasini bosing.</p>
                </div>
                <div className="faq-item">
                     <h4>Maosh qachon tushadi?</h4>
                     <p>Maosh har hafta dushanba kuni hisobingizga o'tkaziladi.</p>
                </div>
            </div>
        </div>
      )}

      <CourierBottomNav activeTab={activeView} onTabChange={setActiveView} />
      
      <style>{`
        .courier-page {
          background: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 100px; /* Space for Bottom Nav */
        }
        
        .courier-header {
          background: linear-gradient(135deg, var(--primary) 0%, #ff8f70 100%);
          color: #fff;
          padding: 25px 20px 35px 20px;
          border-radius: 0 0 35px 35px;
          margin-bottom: 25px;
          box-shadow: 0 15px 40px rgba(255, 75, 58, 0.35);
          margin-top: 0; 
          position: relative;
          overflow: hidden;
        }
        
        /* Background pattern effect */
        .courier-header::before {
            content: '';
            position: absolute; top: -50px; right: -50px;
            width: 200px; height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        }

        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; position: relative; z-index: 2; }
        .header-top h1 { font-size: 24px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.5px; }
        .header-top p { 
            font-size: 14px; opacity: 0.95; margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 500; 
        }
        
        .status-dot {
            width: 8px; height: 8px; background: #4ade80; border-radius: 50%;
            box-shadow: 0 0 10px #4ade80;
        }

        .refresh-btn {
          width: 44px; height: 44px; background: rgba(255,255,255,0.25);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          color: #fff; backdrop-filter: blur(5px);
          transition: transform 0.2s;
        }
        .refresh-btn:active { transform: scale(0.95); }

        .tab-control {
          background: rgba(255,255,255,0.2); padding: 5px; border-radius: 18px;
          display: flex; gap: 5px; position: relative; z-index: 2;
          backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
        }
        
        .tab-btn {
          flex: 1; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 700; font-size: 14px; color: rgba(255,255,255,0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-btn.active { 
            background: #fff; color: var(--primary); 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            transform: scale(1.02);
        }
        .tab-btn.active.warning { 
            background: #fff; color: var(--primary); 
        }

        .content-area {
            padding: 0 16px;
        }

        .section-title {
            font-size: 18px; font-weight: 800; color: var(--secondary); margin-bottom: 15px;
        }

        .history-list {
            display: flex; flex-direction: column; gap: 12px;
        }
        .history-item {
            background: #fff; padding: 16px; border-radius: 18px;
            display: flex; align-items: center; gap: 12px;
            box-shadow: var(--shadow-sm);
        }
        .history-icon {
            width: 40px; height: 40px; background: #e6fffa; color: #00b894;
            border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }
        .history-icon.gray { background: #f1f5f9; color: #94a3b8; }
        .history-info { flex: 1; }
        .history-info h4 { font-size: 15px; font-weight: 700; margin: 0 0 2px 0; color: var(--secondary); }
        .history-info p { font-size: 12px; color: var(--text-muted); margin: 0; }
        .history-price { font-weight: 800; font-size: 15px; color: var(--primary); }
        .history-date-divider {
            font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;
            margin: 10px 0 5px 0; padding-left: 10px;
        }

        .empty-state {
          background: #fff; border-radius: 24px; padding: 40px 20px;
          text-align: center; display: flex; flex-direction: column; align-items: center;
          box-shadow: var(--shadow-sm);
        }
        .icon-circle {
          width: 70px; height: 70px; background: #f0f2f5; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: #a0aab0;
          margin-bottom: 16px;
        }
        .icon-circle.orange { background: #fff5f0; color: var(--primary); }
        .empty-state h3 { font-size: 18px; font-weight: 800; color: var(--secondary); margin-bottom: 6px; }
        .empty-state p { font-size: 13px; color: var(--text-muted); }

        .order-card {
          background: #fff; border-radius: 24px; padding: 20px;
          box-shadow: var(--shadow-sm); margin-bottom: 16px; position: relative;
          overflow: hidden;
        }
        .card-badge {
          position: absolute; top: 0; right: 0; background: #e6fffa; color: #00b894;
          font-size: 11px; font-weight: 800; padding: 6px 16px;
          border-radius: 0 0 0 16px;
        }

        .card-header-row { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
        .id-box {
          width: 50px; height: 50px; background: var(--secondary); color: #fff;
          border-radius: 16px; display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 16px;
        }
        .id-info { display: flex; flex-direction: column; }
        .label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .value { font-size: 15px; font-weight: 800; color: var(--secondary); }

        .info-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .icon {
          width: 32px; height: 32px; background: #fff0eb; color: var(--primary);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .icon.green { background: #e6fffa; color: #00b894; }
        .text { display: flex; flex-direction: column; }
        .value.address { line-height: 1.3; font-size: 14px; }
        .value.price { font-size: 16px; }

        .action-btn {
          width: 100%; height: 50px; border-radius: 16px; font-weight: 800; font-size: 15px;
          display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px;
        }
        .action-btn.black { background: var(--secondary); color: #fff; box-shadow: 0 8px 20px rgba(0,48,45,0.2); }

        .map-card {
          background: #fff; border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-sm); margin-bottom: 20px;
        }
        .map-placeholder {
          height: 160px; background: #f1f5f9; display: flex; flex-direction: column;
          align-items: center; justify-content: center; color: var(--text-muted); gap: 8px;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 16px 16px;
        }
        .pin-bounce { color: var(--primary); animation: bounce 1s infinite; }
        .map-content { padding: 16px; }
        .address-block { display: flex; flex-direction: column; margin-bottom: 16px; }
        .map-btn {
          width: 100%; height: 46px; background: #ebf8ff; color: #0088cc;
          font-weight: 700; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .action-buttons { display: flex; flex-direction: column; gap: 12px; }
        .call-btn {
          height: 54px; background: #00b894; color: #fff; font-weight: 700;
          border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 16px; box-shadow: 0 8px 20px rgba(0,184,148,0.3);
        }
        .complete-btn {
           height: 60px; background: linear-gradient(135deg, #FF4B3A 0%, #FF7E5F 100%);
           color: #fff; font-weight: 900; font-size: 16px; border-radius: 20px;
           display: flex; align-items: center; justify-content: center; gap: 10px;
           box-shadow: 0 10px 30px rgba(255, 75, 58, 0.3);
        }
        .order-summary { 
            background: #fff; padding: 12px; border-radius: 14px; font-size: 14px; color: var(--text-muted);
            text-align: center;
        }

        .courier-profile-card {
            background: #fff; padding: 30px 20px; border-radius: 24px;
            display: flex; flex-direction: column; align-items: center;
            box-shadow: var(--shadow-sm); margin-bottom: 20px;
        }
        .avatar-circle {
            width: 80px; height: 80px; background: var(--primary); color: #fff;
            border-radius: 50%; font-size: 32px; font-weight: 800;
            display: flex; align-items: center; justify-content: center; margin-bottom: 15px;
            box-shadow: 0 10px 25px rgba(255,75,58,0.3);
        }
        .role-batch {
            background: #ebf8ff; color: #0088cc; padding: 4px 12px;
            border-radius: 12px; font-size: 12px; font-weight: 700; margin-top: 5px;
        }
        .stats-row {
            display: flex; gap: 15px; margin-top: 25px; width: 100%; justify-content: space-between;
        }
        .stat-item {
            flex: 1;
            display: flex; flex-direction: column; align-items: center;
            background: #f8f9fa; padding: 12px; border-radius: 16px;
        }
        .stat-icon {
            width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
            justify-content: center; margin-bottom: 8px;
        }
        .stat-item b { font-size: 16px; color: var(--secondary); margin-bottom: 2px; }
        .stat-item span { font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }

        .profile-menu { background: #fff; border-radius: 20px; padding: 10px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: block; gap: 0; }
        .menu-item { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 16px; border: none; background: none; border-bottom: 1px solid #f5f5f5; cursor: pointer; height: auto; box-shadow: none; border-radius: 0; }
        .menu-item:last-child { border-bottom: none; }
        .menu-item span { flex: 1; text-align: left; font-weight: 600; color: #2d3436; margin-left: 14px; font-size: 15px; }
        .menu-icon { width: 36px; height: 36px; background: #FFF5F4; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #FF4B3A; }
        .arrow { color: #b2bec3; }

        /* Settings & Support Styles */
        .sub-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; margin-top: 20px; }
        .back-btn { background: #fff; width: 44px; height: 44px; border-radius: 12px; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); color: #2d3436; cursor: pointer; }
        .sub-header h2 { font-size: 20px; font-weight: 800; margin: 0; color: #00302D; }
        
        .settings-list { background: #fff; border-radius: 20px; padding: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .setting-item { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #f9f9f9; }
        .setting-item:last-child { border-bottom: none; }
        .set-icon { width: 40px; height: 40px; background: #fffbf0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .set-icon.blue { background: #e3f2fd; color: #2196f3; }
        .set-info { flex: 1; margin-left: 15px; }
        .set-info h4 { margin: 0; font-size: 15px; font-weight: 700; color: #2d3436; }
        .set-info p { margin: 2px 0 0 0; font-size: 12px; color: #636e72; font-weight: 500; }
        
        .switch { width: 44px; height: 24px; background: #e0e0e0; border-radius: 12px; position: relative; transition: 0.3s; }
        .switch.active { background: #00b894; }
        .switch.active::after { left: 22px; border-color: #00b894; }
        .switch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        
        /* Support */
        .support-card { background: #fff; padding: 30px 20px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 25px; }
        .icon-circle.orange { background: linear-gradient(135deg, #FFA502, #FF6B81); color: #fff; }
        /* Remove specific action-btn override to avoid conflict with existing button styles, creating specific class instead */
        .support-action-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; border-radius: 16px; font-weight: 700; gap: 10px; text-decoration: none; transition: 0.2s; cursor: pointer; font-size: 15px; margin-bottom: 10px; }
        .support-action-btn.black { background: #00302D; color: #fff; box-shadow: 0 8px 20px rgba(0, 48, 45, 0.2); }
        .support-action-btn.blue { background: #0088cc; color: #fff; box-shadow: 0 8px 20px rgba(0, 136, 204, 0.2); }
        .support-action-btn:active { transform: scale(0.98); }
        
        .faq-list { display: flex; flex-direction: column; gap: 12px; margin-top: 15px; }
        .faq-item { background: #fff; padding: 20px; border-radius: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .faq-item h4 { margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #2d3436; }
        .faq-item p { margin: 0; font-size: 13px; color: #636e72; line-height: 1.5; }

        .logout-btn {
            width: 100%; height: 56px; background: #fee2e2; color: #ef4444; border-radius: 18px;
            font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .section-title {
            font-size: 20px; font-weight: 900; color: var(--secondary); 
            margin-bottom: 20px; padding-left: 10px; border-left: 5px solid var(--primary);
            line-height: 1;
        }

        .summary-container {
            background: #fff; padding: 25px 20px; border-radius: 28px;
            box-shadow: var(--shadow-sm); margin-bottom: 25px;
        }

        .summary-grid { display: flex; gap: 15px; margin-bottom: 0; }
        .summary-card {
            flex: 1; padding: 20px; border-radius: 24px; color: #fff;
            display: flex; flex-direction: column; gap: 12px;
            box-shadow: 0 15px 30px rgba(0,0,0,0.15); position: relative; overflow: hidden;
            transition: transform 0.2s;
        }
        .summary-card:active { transform: scale(0.98); }
        .summary-card.violet { background: linear-gradient(135deg, #8e2de2, #4a00e0); box-shadow: 0 10px 25px rgba(74, 0, 224, 0.4); }
        .summary-card.orange { background: linear-gradient(135deg, #f12711, #f5af19); box-shadow: 0 10px 25px rgba(241, 39, 17, 0.4); }
        
        .s-icon { 
            width: 44px; height: 44px; background: rgba(255,255,255,0.25); border-radius: 14px;
            display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);
        }
        .s-info { display: flex; flex-direction: column; gap: 2px; }
        .s-info span { font-size: 11px; opacity: 0.9; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .s-info b { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }

        .empty-history {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 40px 20px; text-align: center;
            background: #fff; border-radius: 24px; box-shadow: var(--shadow-sm);
            min-height: 250px;
        }
        .big-icon-circle {
            width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; color: #cbd5e1;
            margin-bottom: 20px;
        }
        .empty-history h3 { font-size: 18px; color: var(--secondary); margin-bottom: 5px; }
        .empty-history p { font-size: 14px; color: var(--text-muted); max-width: 200px; line-height: 1.4; }

        .history-group { margin-bottom: 20px; }
        .history-date-label {
            font-size: 12px; font-weight: 800; color: var(--text-muted); 
            text-transform: uppercase; margin-bottom: 10px; padding-left: 5px;
        }
        .history-card {
            background: #fff; padding: 12px 16px; border-radius: 16px;
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            transition: transform 0.2s;
        }
        .history-card:active { transform: scale(0.98); }
        
        .h-left { display: flex; align-items: center; gap: 12px; }
        .h-icon {
            width: 36px; height: 36px; background: #e6fffa; color: #00b894;
            border-radius: 10px; display: flex; align-items: center; justify-content: center;
        }
        .h-details { display: flex; flex-direction: column; }
        .h-details h4 { font-size: 14px; font-weight: 700; color: var(--secondary); margin: 0; }
        .h-details span { font-size: 11px; color: var(--text-muted); }
        
        .h-right { font-weight: 800; font-size: 14px; color: var(--primary); }
      `}</style>
    </div>
  );
};

export default Courier;
