import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasValidSession } from '../../utils/nativeAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const valid = hasValidSession();

  // Show loading while auth is being determined, unless session is already present locally
  if (loading && !valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !valid) {
    return <Navigate to="/login-screen" replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;