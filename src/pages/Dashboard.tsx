
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Video, 
  ShoppingBag, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const Dashboard = () => {
  const { userProfile, userRole, isLoading } = useAuth();
  const isAdmin = userRole === 'admin' || userRole === 'super-admin';

  console.log('🏠 Dashboard render:', { 
    userProfile: !!userProfile, 
    userRole, 
    isLoading, 
    isAdmin,
    fullProfile: userProfile 
  });

  const stats = [
    { label: 'Blog Posts', value: '12', icon: BookOpen, change: '+2 this week' },
    { label: 'Videos', value: '8', icon: Video, change: '+1 this week' },
    { label: 'Templates', value: '5', icon: FileText, change: 'No change' },
    { label: 'Products', value: '3', icon: ShoppingBag, change: '+1 this week' }
  ];

  const quickActions = [
    { label: 'New Blog Post', href: '/admin/blogs/new', icon: BookOpen },
    { label: 'Upload Video', href: '/admin/videos/new', icon: Video },
    { label: 'Add Template', href: '/admin/templates/new', icon: FileText },
    { label: 'Create Product', href: '/admin/marketplace/new', icon: ShoppingBag }
  ];

  // Show loading state while auth is loading
  if (isLoading) {
    console.log('🏠 Dashboard: Still loading auth...');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log('🏠 Dashboard: Rendering main content');

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {userProfile?.full_name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your content today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Creator" : "Member"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats for All Users */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Following</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.following_count || 0}</div>
              <p className="text-xs text-muted-foreground">People you follow</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.followers_count || 0}</div>
              <p className="text-xs text-muted-foreground">People following you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">Total views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Likes & comments</p>
            </CardContent>
          </Card>
        </div>

        {/* Creator Stats - Only for Admins */}
        {isAdmin && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions - Only for Admins */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Create new content quickly from here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    asChild
                  >
                    <Link to={action.href}>
                      <action.icon className="h-6 w-6" />
                      <span className="text-sm">{action.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Joined CloudScribe</p>
                    <p className="text-xs text-muted-foreground">Welcome to the platform!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Profile updated</p>
                    <p className="text-xs text-muted-foreground">Profile information updated</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Started following creators</p>
                    <p className="text-xs text-muted-foreground">Discover amazing content</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Discover Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Latest Blogs</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/blogs">View All</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">New Videos</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/videos">Watch</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Templates</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/templates">Browse</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Communities</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/communities">Join</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started - For new users */}
        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Explore what CloudScribe has to offer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Discover Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore blogs, videos, and templates from amazing creators.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/feed">View Feed</Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Join Communities</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with like-minded people in various communities.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/communities">Browse Communities</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
