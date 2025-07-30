import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Home,
  Rss,
  Search,
  User,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebarMenu } from './MobileSidebarMenu';

export const MobileBottomNavigation = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  if (!userProfile) {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Rss, label: 'Feeds', path: '/dashboard/feeds' },
    { icon: Search, label: 'Search', path: '/dashboard/search' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t overflow-x-auto">
      <div className="flex items-center justify-around h-16 px-4 min-w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0",
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Menu Button with Drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 h-auto"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs font-medium">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-[80vh] animate-slide-in-right data-[state=closed]:animate-slide-out-right overflow-y-auto"
          >
            <div className="overflow-y-auto h-full">
              <MobileSidebarMenu onItemClick={() => {}} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};