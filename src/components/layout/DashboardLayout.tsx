
import { ReactNode } from 'react';
import { UnifiedSidebar } from './UnifiedSidebar';
import { Header } from './Header';
import { AnnouncementBanner } from '@/components/notifications/AnnouncementBanner';
import { MobileBottomNavigation } from './MobileBottomNavigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  console.log('🏗️ DashboardLayout rendering with children:', !!children);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <UnifiedSidebar />
        <main className="flex-1 p-6 pb-20 md:pb-6 md:ml-64">
          <AnnouncementBanner />
          {children}
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
};
