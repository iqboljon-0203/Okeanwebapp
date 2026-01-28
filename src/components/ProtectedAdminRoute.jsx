import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="loader-logo">
                <span style={{fontSize: '24px', fontWeight: '800', color: '#FF4B3A'}}>OKEAN</span>
            </div>
        </div>
    );
  }
  
  if (user?.role !== 'admin') {
    console.warn("ProtectedAdminRoute: Access Denied. Role is:", user?.role);
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedAdminRoute: Access Granted");

  return children ? children : <Outlet />;
};

export default ProtectedAdminRoute;
