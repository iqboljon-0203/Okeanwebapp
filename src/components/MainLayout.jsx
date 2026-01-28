import React from 'react';
import BottomNav from './BottomNav';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const hideNavRoutes = ['/checkout', '/admin', '/courier'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="app-layout">
      <main className="main-content">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
