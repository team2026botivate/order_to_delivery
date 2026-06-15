import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, permissionKey }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // or a proper spinner
  }

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin has access to everything
  if (user.role === 'ADMIN') {
    return children;
  }

  // Check specific page permission
  if (permissionKey && !user.permissions[permissionKey]) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If no specific permissionKey required or user has permission, allow access
  return children;
}
