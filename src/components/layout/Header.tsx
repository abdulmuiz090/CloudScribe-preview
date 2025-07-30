import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileRouting } from '@/hooks/use-profile-routing';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { CartDropdown } from '@/components/cart/CartDropdown';
import { Bell, Search, User, Settings, LogOut, Shield, Crown } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: string;
}

export const Header = () => {
  const { user, userProfile, userRole, signOut } = useAuth();
  const { navigateToProfile, canHaveProfile } = useProfileRouting();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await getUserNotifications(10);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleProfileClick = () => {
    if (canHaveProfile(userRole)) {
      navigateToProfile();
    } else {
      // Super admin goes to owner dashboard instead of profile
      navigate('/owner');
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'super-admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'super-admin':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'admin':
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors"
        >
          <div className={`w-8 h-8 rounded-lg ${getRoleColor()} flex items-center justify-center text-white font-bold text-sm`}>
            CS
          </div>
          CloudScribe
        </Link>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <GlobalSearch />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate('/dashboard/search')}
          >
            <Search className="h-5 w-5" />
          </Button>

          {user ? (
            <>
              {/* Cart */}
              <CartDropdown />

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="p-3 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-2 w-full">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={userProfile?.profile_image_url || undefined} 
                        alt={userProfile?.full_name || 'User'} 
                      />
                      <AvatarFallback>
                        {userProfile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {getRoleIcon() && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        {getRoleIcon()}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getRoleIcon()}
                        <Badge variant="outline" className="text-xs">
                          {userRole}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {canHaveProfile(userRole) ? (
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/owner')}>
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Owner Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
