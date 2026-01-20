import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const { count } = useCart();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Asosiy</span>
      </NavLink>
      
      <NavLink to="/catalog" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={22} />
        <span>Katalog</span>
      </NavLink>

      <div className="cart-center-wrapper">
        <NavLink to="/cart" className="cart-center shadow-lg">
          <ShoppingCart size={26} color="#fff" strokeWidth={2.5} />
        </NavLink>
      </div>

      <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Heart size={22} />
        <span>Saralangan</span>
      </NavLink>
      
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>Profil</span>
      </NavLink>

      <style jsx>{`
        .nav-item.active span {
          font-weight: 700;
        }
        .nav-item.active svg {
          transform: translateY(-2px);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .badge {
          border: 2px solid #fff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
