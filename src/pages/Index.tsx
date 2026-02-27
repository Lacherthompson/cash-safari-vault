import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/onboard" replace />;
  }

  // After Google OAuth: user authenticated but hasn't finished onboarding yet
  if (
    localStorage.getItem('savetogether_onboarded') !== 'true' &&
    localStorage.getItem('savetogether_pending_vault')
  ) {
    return <Navigate to="/onboard" replace />;
  }

  return <Dashboard />;
}
