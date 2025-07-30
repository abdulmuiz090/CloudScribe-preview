

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useProfileRouting() {
  const { userProfile, userRole } = useAuth();
  const navigate = useNavigate();

  const getProfileRoute = useCallback((userId?: string) => {
    // If it's the current user, determine their route based on role
    if (!userId || userId === userProfile?.id) {
      switch (userRole) {
        case 'super-admin':
          // Super admin shouldn't have profile because they are managers, not creators
          return '/owner'; // Redirect to owner dashboard instead
        case 'admin':
          // Admin users use userProfile
          const adminUsername = userProfile?.username || userProfile?.email?.split('@')[0] || userProfile?.id?.slice(0, 8);
          return `/profile/${adminUsername}`;
        case 'user':
        default:
          // Normal users use profile
          const userUsername = userProfile?.username || userProfile?.email?.split('@')[0] || userProfile?.id?.slice(0, 8);
          return `/profile/${userUsername}`;
      }
    }

    // For other users, always use the public profile route
    return `/admin/profile/${userId}`;
  }, [userProfile, userRole]);

  const navigateToProfile = useCallback((userId?: string) => {
    const route = getProfileRoute(userId);
    navigate(route);
  }, [navigate, getProfileRoute]);

  const canHaveProfile = useCallback((role?: string) => {
    // Super admins are managers, not creators, so they don't have profiles
    return role !== 'super-admin';
  }, []);

  return {
    getProfileRoute,
    navigateToProfile,
    canHaveProfile
  };
}

