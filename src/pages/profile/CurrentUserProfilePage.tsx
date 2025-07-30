
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CurrentUserProfilePage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      // Redirect to the username-based profile route
      const username = userProfile.username || userProfile.email?.split('@')[0] || userProfile.id?.slice(0, 8);
      if (username) {
        navigate(`/profile/${username}`, { replace: true });
      }
    }
  }, [userProfile, navigate]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CurrentUserProfilePage;
