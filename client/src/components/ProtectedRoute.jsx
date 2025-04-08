import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/products', '/search', '/cisco-switch', '/server', '/monitors', '/logitech', '/bags', '/charger'];

  // If we're still loading, show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  // Allow access to public routes without authentication
  if (publicRoutes.includes(location.pathname)) {
    return children;
  }

  // For protected routes, redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 