import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedCourierRoute = ({ children }) => {
  const { user } = useUser();

  // If user is not yet loaded or not strictly a courier, redirect.
  // Note: Optimally we would have a loading state, but following the pattern in ProtectedAdminRoute:
  
  // DEV MODE BYPASS: Allow access if in dev mode
  if (import.meta.env.DEV) {
    return children ? children : <Outlet />;
  }

  if (user?.role !== 'courier') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedCourierRoute;
