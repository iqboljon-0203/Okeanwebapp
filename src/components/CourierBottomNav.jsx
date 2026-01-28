import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';

const CourierBottomNav = ({ activeTab, onTabChange }) => {
  return (
    <div className="courier-nav">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={24} />
        <span>Asosiy</span>
      </button>
      
      <button 
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <ClipboardList size={24} />
        <span>Tarix</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <User size={24} />
        <span>Profil</span>
      </button>

      <style>{`
        .courier-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 80px; background: #fff;
          display: flex; justify-content: space-around; align-items: center;
          border-top: 1px solid rgba(0,0,0,0.05);
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -5px 20px rgba(0,0,0,0.03);
          z-index: 1000;
          padding-bottom: 10px;
        }
        .nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          color: #94a3b8; width: 60px; transition: all 0.3s ease;
        }
        .nav-item.active {
          color: var(--primary);
          transform: translateY(-2px);
        }
        .nav-item span {
          font-size: 11px; font-weight: 700;
        }
        .nav-item.active span {
            font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default CourierBottomNav;
