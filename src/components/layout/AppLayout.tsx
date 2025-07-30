
import { ReactNode } from 'react';
import { Header } from './Header';
import { UnifiedSidebar } from './UnifiedSidebar';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { AnnouncementBanner } from '@/components/notifications/AnnouncementBanner';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <UnifiedSidebar />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <AnnouncementBanner />
          {children}
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  );
};
