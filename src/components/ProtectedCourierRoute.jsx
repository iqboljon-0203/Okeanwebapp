import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedCourierRoute = ({ children }) => {
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

  // DEV MODE BYPASS: Allow access if in dev mode
  if (import.meta.env.DEV) {
    return children ? children : <Outlet />;
  }

  if (user?.role !== 'courier') {
    console.warn("ProtectedCourierRoute: Access Denied. Role is:", user?.role);
    return <Navigate to="/" replace />;
  }
  
  console.log("ProtectedCourierRoute: Access Granted");

  return children ? children : <Outlet />;
};

export default ProtectedCourierRoute;
