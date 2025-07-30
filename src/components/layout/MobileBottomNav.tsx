
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Rocket, ShoppingBag, Wallet, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useState } from 'react';
import { MobileSidebarMenu } from './MobileSidebarMenu';

export const MobileBottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isMobile) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Rocket, label: 'Space', path: '/spaces' },
    { icon: ShoppingBag, label: 'Market', path: '/marketplace' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors",
              isActive(item.path)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </Link>
        ))}
        
        <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Navigation Menu</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <MobileSidebarMenu onItemClick={() => setIsMenuOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
