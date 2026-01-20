import React from 'react';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import { User, MapPin, Bell, ShieldCheck, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <MapPin size={20} />, label: 'Mening manzillarim', color: '#4facfe', path: '/addresses' },
    { icon: <Bell size={20} />, label: 'Bildirishnomalar', color: '#fa709a', path: '/notifications' },
    { icon: <ShieldCheck size={20} />, label: 'Xavfsizlik', color: '#00b894', path: '/security' },
    { icon: <HelpCircle size={20} />, label: 'Yordam markazi', color: '#f9ca24', path: '/help' },
  ];

  return (
    <div className="profile-page animate-up">
      <Header />
      
      <div className="page-container">
        <div className="profile-header shadow">
          <div className="avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="User Avatar" />
            ) : (
              <span>{user.name?.charAt(0) || 'M'}</span>
            )}
          </div>
          <div className="user-info">
            <h2>{user.name}</h2>
            <p className="username">
              {user.username ? `@${user.username}` : (user.phone || 'ID: ' + (user.telegramId || '---'))}
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card shadow">
            <span className="value">12</span>
            <span className="label">Buyurtmalar</span>
          </div>
          <div className="stat-card shadow">
            <span className="value">0</span>
            <span className="label">Kuponlar</span>
          </div>
          <div className="stat-card shadow">
            <span className="value">150</span>
            <span className="label">Ballar</span>
          </div>
        </div>

        <div className="menu-list shadow">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className="menu-item"
              onClick={() => item.path && navigate(item.path)}
            >
              <div className="icon-box" style={{ background: `${item.color}20`, color: item.color }}>
                {item.icon}
              </div>
              <span className="label">{item.label}</span>
              <ChevronRight size={18} color="#BDC3C7" />
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>

      <style jsx>{`
        .profile-header {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        .avatar {
          width: 60px;
          height: 60px;
          background: var(--primary-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          overflow: hidden;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .user-info {
          flex: 1;
        }
        .user-info h2 {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .user-info p {
          font-size: 14px;
          color: var(--text-muted);
        }
        .edit-btn {
          padding: 8px 16px;
          background: #F1F4F5;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: var(--secondary);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px 10px;
          text-align: center;
        }
        .stat-card .value {
          display: block;
          font-size: 24px;
          font-weight: 900;
          color: var(--secondary);
          margin-bottom: 5px;
        }
        .stat-card .label {
          font-size: 12px;
          color: var(--text-muted);
        }
        .menu-list {
          background: #fff;
          border-radius: 20px;
          padding: 10px;
          margin-bottom: 20px;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 10px;
          cursor: pointer;
        }
        .menu-item .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-item .label {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
          color: var(--secondary);
        }
        .logout-btn {
          width: 100%;
          padding: 15px;
          background: #fff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #e74c3c;
          font-weight: 700;
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
};

export default Profile;
