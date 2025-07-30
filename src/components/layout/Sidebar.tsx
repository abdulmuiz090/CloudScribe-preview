import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  Home,
  BookOpen,
  Box,
  ShoppingBag,
  Settings,
  User,
  Rss,
  Search,
  Users,
  FileBox,
  Video,
  Bell,
  Layers,
  UserCheck,
  Rocket,
  FileText,
  MessageSquare,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const { userRole, userProfile } = useAuth();

  const isPathActive = (path: string) => pathname === path;
  const isAdmin = userRole === 'admin' || userRole === 'super-admin';

  // Generate fallback username for profile navigation
  const displayUsername = userProfile?.username || userProfile?.email?.split('@')[0] || userProfile?.id?.slice(0, 8) || 'user';

  return (
    <div className={cn(
      "hidden md:flex flex-col h-screen bg-background border-r transition-all duration-300 fixed left-0 top-0 z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="py-2 flex-1 overflow-y-auto pt-16">
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">CloudScribe</h2>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="ml-auto"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <nav className="grid items-start px-4 text-sm">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <Home className="h-4 w-4" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/feed"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Feed" : undefined}
          >
            <Rss className="h-4 w-4" />
            {!isCollapsed && <span>Feed</span>}
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Search" : undefined}
          >
            <Search className="h-4 w-4" />
            {!isCollapsed && <span>Search</span>}
          </NavLink>

          {!isCollapsed && (
            <div className="mt-4">
              <div className="px-3 mb-2 text-xs font-semibold tracking-tight text-muted-foreground">
                CloudScribe
              </div>
            </div>
          )}

          <NavLink
            to="/spaces"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Spaces" : undefined}
          >
            <Rocket className="h-4 w-4" />
            {!isCollapsed && <span>Spaces</span>}
          </NavLink>

          <NavLink
            to="/posts"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Posts" : undefined}
          >
            <FileText className="h-4 w-4" />
            {!isCollapsed && <span>Posts</span>}
          </NavLink>

          <NavLink
            to="/communities"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Communities" : undefined}
          >
            <MessageSquare className="h-4 w-4" />
            {!isCollapsed && <span>Communities</span>}
          </NavLink>
          
          {!isCollapsed && (
            <div className="mt-4">
              <div className="px-3 mb-2 text-xs font-semibold tracking-tight text-muted-foreground">
                Marketplace
              </div>
            </div>
          )}

          <NavLink
            to="/blogs"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Blogs" : undefined}
          >
            <BookOpen className="h-4 w-4" />
            {!isCollapsed && <span>Blogs</span>}
          </NavLink>
          
          <NavLink
            to="/templates"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Templates" : undefined}
          >
            <Box className="h-4 w-4" />
            {!isCollapsed && <span>Templates</span>}
          </NavLink>
          
          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Products" : undefined}
          >
            <ShoppingBag className="h-4 w-4" />
            {!isCollapsed && <span>Products</span>}
          </NavLink>

          <NavLink
            to="/admin-directory"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Admin Directory" : undefined}
          >
            <UserCheck className="h-4 w-4" />
            {!isCollapsed && <span>Admin Directory</span>}
          </NavLink>
          
          {!isCollapsed && (
            <div className="mt-6">
              <div className="px-3 mb-2 text-xs font-semibold tracking-tight text-muted-foreground">
                Account
              </div>
            </div>
          )}
        
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Profile" : undefined}
          >
            <User className="h-4 w-4" />
            {!isCollapsed && <span>Profile</span>}
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Chat" : undefined}
          >
            <MessageSquare className="h-4 w-4" />
            {!isCollapsed && <span>Chat</span>}
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )
            }
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
          
          {/* Only show Admin Panel to admins */}
          {isAdmin && (
            <>
              {!isCollapsed && (
                <div className="mt-6">
                  <div className="px-3 mb-2 text-xs font-semibold tracking-tight text-muted-foreground">
                    Admin
                  </div>
                </div>
              )}
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                  )
                }
                title={isCollapsed ? "Admin Panel" : undefined}
              >
                <Layers className="h-4 w-4" />
                {!isCollapsed && <span>Admin Panel</span>}
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
