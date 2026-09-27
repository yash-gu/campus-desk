import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  studentOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  studentOnly = false
}) => {
  const { authState } = useAuth();

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Admin-only route protection
  if (adminOnly && authState.user?.role !== 'admin') {
    toast.error('Access Denied: Admin privileges required');
    return <Redirect to="/dashboard" />;
  }

  // Student-only route protection (if needed)
  if (studentOnly && authState.user?.role !== 'student') {
    toast.error('Access Denied: Student privileges required');
    return <Redirect to="/admin-dashboard" />;
  }

  // User is authenticated and has proper role - render children
  return <>{children}</>;
};

export default ProtectedRoute;
