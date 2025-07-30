
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  User,
  ShoppingCart,
  Wallet,
  BarChart3,
  Users,
  FileText,
  Video,
  LayoutTemplate,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const CollapsibleSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { userProfile, userRole } = useAuth();

  console.log('🏗️ CollapsibleSidebar rendering:', { 
    userProfile: !!userProfile, 
    userRole,
    currentPath: location.pathname 
  });

  // Show sidebar for admin and super-admin users
  if (!userProfile || (userRole !== 'admin' && userRole !== 'super-admin')) {
    console.log('🏗️ CollapsibleSidebar: Not showing sidebar for user role:', userRole);
    return null;
  }

  // Different navigation based on user role
  const getNavigation = () => {
    if (userRole === 'super-admin') {
      return [
        { name: 'Dashboard', href: '/owner', icon: Home },
        { name: 'Users', href: '/owner/users', icon: Users },
        { name: 'Admins', href: '/owner/admins', icon: User },
        { name: 'Requests', href: '/owner/requests', icon: MessageSquare },
        { name: 'Blogs', href: '/owner/blogs', icon: FileText },
        { name: 'Videos', href: '/owner/videos', icon: Video },
        { name: 'Templates', href: '/owner/templates', icon: LayoutTemplate },
        { name: 'Marketplace', href: '/owner/marketplace', icon: ShoppingCart },
        { name: 'Settings', href: '/owner/settings', icon: Settings },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
        { name: 'Products', href: '/admin/marketplace', icon: ShoppingCart },
        { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Blogs', href: '/admin/blogs', icon: FileText },
        { name: 'Videos', href: '/admin/videos', icon: Video },
        { name: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
        { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }
  };

  const navigation = getNavigation();

  return (
    <div className={cn(
      "hidden md:flex md:flex-col h-screen bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">
              {userRole === 'super-admin' ? 'Owner Panel' : 'Admin Panel'}
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {userProfile.full_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userProfile.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole === 'super-admin' ? 'Owner' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
