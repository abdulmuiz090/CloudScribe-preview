import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Box,
  Settings,
  User,
  Rss,
  Users,
  UserCheck,
  Layers,
  FileText,
  MessageSquare,
  LogOut,
  ShoppingBag,
  BarChart3,
  Wallet,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MobileSidebarMenuProps {
  onItemClick: () => void;
}

export const MobileSidebarMenu: React.FC<MobileSidebarMenuProps> = ({ onItemClick }) => {
  const { userRole, signOut } = useAuth();

  const isAdmin = userRole === 'admin' || userRole === 'super-admin';
  const isSuper = userRole === 'super-admin';

  const handleSignOut = async () => {
    await signOut();
    onItemClick();
  };

  const menuSections = [
    {
      title: 'Main',
      items: [
        { icon: Rss, label: 'Feeds', path: '/dashboard/feeds' },
        { icon: FileText, label: 'Posts', path: '/dashboard/posts' },
        { icon: MessageSquare, label: 'Communities', path: '/dashboard/communities' },
        { icon: BookOpen, label: 'Blogs', path: '/dashboard/blogs' },
        { icon: Box, label: 'Templates', path: '/dashboard/templates' },
        { icon: Layers, label: 'Spaces', path: '/dashboard/spaces' },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { icon: ShoppingBag, label: 'Marketplace', path: '/dashboard/marketplace' },
        { icon: UserCheck, label: 'Admin Directory', path: '/admin/directory' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { icon: MessageSquare, label: 'Chat', path: '/dashboard/chat' },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
        { icon: Search, label: 'Search', path: '/dashboard/search' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', path: '/dashboard/profile' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
      ],
    },
  ];

  if (isAdmin) {
    menuSections.push({
      title: 'Admin',
      items: [
        {
          icon: Layers,
          label: 'Admin Panel',
          path: isSuper ? '/owner' : '/admin',
        },
      ],
    });
  }

  return (
    <div className="space-y-6">
      {menuSections.map((section, index) => (
        <div key={section.title}>
          <div className="text-sm font-semibold text-muted-foreground mb-3 px-2">
            {section.title}
          </div>
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          {index < menuSections.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
      
      <Separator />
      
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="mr-3 h-5 w-5" />
        Sign Out
      </Button>
    </div>
  );
};