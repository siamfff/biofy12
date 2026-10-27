import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FullScreenLoader } from '../ui/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but no username → force setup
  if (profile && !profile.username && location.pathname !== '/setup-username') {
    return <Navigate to="/setup-username" replace />;
  }

  return <>{children}</>;
}