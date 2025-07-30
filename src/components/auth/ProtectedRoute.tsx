
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'super-admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user' 
}) => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const checkRole = () => {
    if (requiredRole === 'super-admin') {
      return userRole === 'super-admin';
    }
    
    if (requiredRole === 'admin') {
      return userRole === 'admin' || userRole === 'super-admin';
    }
    
    return true; // Any authenticated user
  };

  const getRoleDashboard = () => {
    if (userRole === 'super-admin') {
      return '/owner';
    } else if (userRole === 'admin') {
      return '/admin';
    } else {
      return '/dashboard';
    }
  };

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      return;
    }

    console.log('🔐 ProtectedRoute check:', { 
      hasUser: !!user, 
      userRole, 
      isLoading, 
      currentPath: location.pathname,
      requiredRole
    });

    // If no user, redirect to login
    if (!user) {
      console.log('🔐 No user found, redirecting to login');
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // If user doesn't have required role, redirect to appropriate dashboard
    if (!checkRole()) {
      const dashboardPath = getRoleDashboard();
      console.log('🔐 Insufficient role, redirecting to:', dashboardPath);
      if (location.pathname !== dashboardPath) {
        navigate(dashboardPath, { replace: true });
        return;
      }
    }

    // All checks passed
    setHasCheckedAuth(true);
  }, [user, userRole, isLoading, navigate, location.pathname, requiredRole]);

  // Show loading while auth is loading
  if (isLoading) {
    console.log('🔐 Auth still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    console.log('🔐 No user, not rendering children');
    return null;
  }

  // Don't render if user doesn't have required role
  if (!checkRole()) {
    console.log('🔐 Role check failed, not rendering children');
    return null;
  }

  // Don't render until we've completed the auth check
  if (!hasCheckedAuth) {
    console.log('🔐 Auth check not complete, showing loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  console.log('🔐 All checks passed, rendering children');
  return <>{children}</>;
};
