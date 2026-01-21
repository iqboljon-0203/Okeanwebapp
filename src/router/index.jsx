import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home'));
const Catalog = lazy(() => import('../pages/Catalog'));
const Cart = lazy(() => import('../pages/Cart'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Profile = lazy(() => import('../pages/Profile'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Addresses = lazy(() => import('../pages/Addresses'));
const Security = lazy(() => import('../pages/Security'));
const Help = lazy(() => import('../pages/Help'));

const AppRouter = () => {
  const location = useLocation();

  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="loader-logo">
          <span className="okean">OKEAN</span>
          <span className="market">SUPERMARKET</span>
        </div>
        <div className="loader-bar"></div>
      </div>
    }>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/security" element={<Security />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <style>{`
        .loading-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
        }
        .loader-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 25px;
        }
        .loader-logo .okean {
          font-size: 42px;
          font-weight: 950;
          color: #FF4B3A;
          line-height: 1;
          letter-spacing: -1px;
        }
        .loader-logo .market {
          font-size: 12px;
          font-weight: 800;
          color: #00302D;
          text-transform: uppercase;
          letter-spacing: 5px;
          margin-top: 4px;
        }
        .loader-bar {
          width: 120px;
          height: 4px;
          background: #f0f0f0;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }
        .loader-bar::after {
          content: '';
          position: absolute;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--primary-gradient);
          animation: loading-bar 1.5s infinite linear;
        }
        @keyframes loading-bar {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </Suspense>
  );
};

export default AppRouter;
