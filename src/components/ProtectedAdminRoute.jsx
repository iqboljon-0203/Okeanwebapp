import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useUser();

  // If user data isn't fully loaded yet (e.g. initial 'Mehmon' state before Telegram sync), 
  // you might want a loading state. But for now, we check the role.
  // Assuming 'user' defaults to 'user' role or null.
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedAdminRoute;
