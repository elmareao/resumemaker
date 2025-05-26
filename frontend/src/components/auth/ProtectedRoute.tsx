import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path as necessary

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Render a loading spinner or a blank page while checking auth status
    // For simplicity, a basic loading message:
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-700">Loading authentication status...</p>
        {/* Or a spinner component */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child route content
  return <Outlet />; 
  // If not using <Outlet /> for nested routes, you might pass children:
  // return <>{children}</>;
};

export default ProtectedRoute;
