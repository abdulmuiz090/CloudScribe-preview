import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  Rss,
  FileText,
  MessageSquare,
  BookOpen,
  Box,
  ShoppingBag,
  Rocket,
  BarChart3,
  Wallet,
  Search,
  Settings,
  User,
  Shield,
  Users,
  UserCheck,
  Video,
  MessageCircle,
} from 'lucide-react';

export const UnifiedSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { userProfile, userRole } = useAuth();

  if (!userProfile) {
    return null;
  }

  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Feeds', href: '/dashboard/feeds', icon: Rss },
      { name: 'Posts', href: '/dashboard/posts', icon: FileText },
      { name: 'Communities', href: '/dashboard/communities', icon: MessageSquare },
      { name: 'Blogs', href: '/dashboard/blogs', icon: BookOpen },
      { name: 'Templates', href: '/dashboard/templates', icon: Box },
      { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
      { name: 'Spaces', href: '/dashboard/spaces', icon: Rocket },
      { name: 'Chat', href: '/dashboard/chat', icon: MessageCircle },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
      { name: 'Search', href: '/dashboard/search', icon: Search },
    ];

    const accountNavigation = [
      { name: 'Profile', href: '/dashboard/profile', icon: User },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const adminNavigation = [];
    if (userRole === 'admin' || userRole === 'super-admin') {
      adminNavigation.push(
        { name: 'Admin Panel', href: '/admin', icon: Shield },
        { name: 'Directory', href: '/admin/directory', icon: Users },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Feedback', href: '/admin/feedback', icon: MessageCircle },
      );
    }

    if (userRole === 'super-admin') {
      adminNavigation.push(
        { name: 'Owner Panel', href: '/owner', icon: Shield },
        { name: 'User Management', href: '/owner/users', icon: Users },
        { name: 'Admin Management', href: '/owner/admins', icon: UserCheck },
        { name: 'Admin Requests', href: '/owner/admin-requests', icon: FileText },
      );
    }

    return {
      main: baseNavigation,
      account: accountNavigation,
      admin: adminNavigation,
    };
  };

  const navigation = getNavigation();

  const renderNavSection = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-1">
        {!isCollapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </div>
        )}
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn(
      "hidden md:flex md:flex-col h-screen bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">CloudScribe</h2>
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
          <nav className="p-2 space-y-4">
            {renderNavSection('Main', navigation.main)}
            {renderNavSection('Account', navigation.account)}
            {renderNavSection('Admin', navigation.admin)}
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
                  {userRole === 'super-admin' ? 'Owner' : userRole}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};