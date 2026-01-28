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
    console.warn("ProtectedCourierRoute: Access Denied. Role is:", user?.role);
    return <Navigate to="/" replace />;
  }
  
  console.log("ProtectedCourierRoute: Access Granted");

  return children ? children : <Outlet />;
};

export default ProtectedCourierRoute;
