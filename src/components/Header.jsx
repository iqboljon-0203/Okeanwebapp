import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ChevronDown, MapPin, ShoppingCart, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import LocationPicker from './LocationPicker';
import AddressSelector from './AddressSelector';
import { supabase } from '../lib/supabase';

const Header = () => {
  const { user, updateProfile } = useUser();
  const { count } = useCart();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
        if (!user?.telegramId) return;
        // Count unread notifications (e.g. status='new' or 'delivered' within last 24h)
        // For MVP: status = 'new' orders are considered unread/important
        const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.telegramId)
            .eq('status', 'new');
        
        setUnreadCount(count || 0);
    };
    fetchUnread();
  }, [user]);

  const handleLocationSelect = (data) => {
    updateProfile({ 
      address: data.address,
      coords: data.coords
    });
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <Link to="/" className="logo-section">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <ShoppingCart size={22} color="#FF4B3A" strokeWidth={2.5} fill="#FF4B3A" />
            </div>
          </div>
          <div className="logo-text">
            <span className="brand-name">OKEAN</span>
            <span className="brand-sub">SUPERMARKET</span>
          </div>
        </Link>
        
        <div className="header-actions">
            <Link to="/notifications" className="header-btn shadow-sm">
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </Link>
            
            <Link to="/cart" className="header-btn shadow-sm">
                <ShoppingBag size={20} />
                {count > 0 && <span className="badge cart-badge">{count}</span>}
            </Link>
        </div>
      </div>

      <div className="header-location shadow-sm" onClick={() => setShowAddressSelector(true)}>
        <div className="loc-icon">
          <MapPin size={16} />
        </div>
        <div className="loc-content">
          <span className="loc-label">Yetkazib berish manzili</span>
          <span className="loc-address">
            {user.address || 'Manzilni tanlang'} <ChevronDown size={14} />
          </span>
        </div>
      </div>

      {showAddressSelector && (
        <AddressSelector 
          onClose={() => setShowAddressSelector(false)}
          onSelect={(data) => {
            handleLocationSelect(data);
            setShowAddressSelector(false);
          }}
          onAddNew={() => {
            setShowAddressSelector(false);
            setShowLocationPicker(true);
          }}
        />
      )}

      {showLocationPicker && (
        <LocationPicker 
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelect}
        />
      )}

      <style>{`
        .main-header {
          background: #fff;
          padding: 15px 16px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          position: sticky;
          top: 0;
          z-index: 3000; /* Higher than search bar (2000) */
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-circle {
          width: 44px;
          height: 44px;
          background: #00302D;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 48, 45, 0.2);
          border: 2px solid #FFD700;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 0.9;
        }
        .brand-name {
          font-size: 20px;
          font-weight: 900;
          color: #FF4B3A;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 10px;
          font-weight: 700;
          color: #00302D;
          letter-spacing: 1px;
        }
        .header-actions {
          display: flex; gap: 10px; align-items: center;
        }
        .header-btn {
          width: 42px;
          height: 42px;
          background: #F8F9FA;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--secondary);
        }
        .header-btn .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #FF4B3A; /* Red for alert */
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
        }
        .header-btn .cart-badge {
            background: var(--primary); /* Maintain primary color for cart */
        }
        .header-location {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F8F9FA;
          padding: 10px 14px;
          border-radius: 16px;
          cursor: pointer;
        }
        .loc-icon { color: var(--primary); }
        .loc-label { font-size: 10px; color: var(--text-muted); }
        .loc-address { font-size: 13px; font-weight: 600; color: var(--secondary); display: flex; align-items: center; gap: 4px; }
      `}</style>
    </header>
  );
};

export default Header;
