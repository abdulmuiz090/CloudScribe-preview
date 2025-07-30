import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Video,
  FileText,
  ShoppingBag,
  Plus,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare
} from "lucide-react";

interface AdminStats {
  myBlogs: number;
  myVideos: number;
  myTemplates: number;
  myProducts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
}

const AdminDashboard = () => {
  const { userProfile, user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    myBlogs: 0,
    myVideos: 0,
    myTemplates: 0,
    myProducts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  console.log('AdminDashboard render:', { userProfile: !!userProfile, user: !!user, isLoading });

  useEffect(() => {
    if (user) {
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching admin stats for user:', user.id);
      
      const [
        { count: blogsCount },
        { count: videosCount },
        { count: templatesCount },
        { count: productsCount }
      ] = await Promise.all([
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('videos').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('templates').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', user.id)
      ]);

      console.log('Admin stats fetched:', { blogsCount, videosCount, templatesCount, productsCount });

      setStats({
        myBlogs: blogsCount || 0,
        myVideos: videosCount || 0,
        myTemplates: templatesCount || 0,
        myProducts: productsCount || 0,
        totalViews: Math.floor(Math.random() * 10000), // Placeholder
        totalLikes: Math.floor(Math.random() * 1000), // Placeholder
        totalComments: Math.floor(Math.random() * 500), // Placeholder
        totalFollowers: userProfile?.followers_count || 0
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard statistics."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Blog Post', href: '/admin/blogs/new', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Upload Video', href: '/admin/videos/new', icon: Video, color: 'text-red-600' },
    { label: 'Add Template', href: '/admin/templates/new', icon: FileText, color: 'text-green-600' },
    { label: 'Create Product', href: '/admin/marketplace/new', icon: ShoppingBag, color: 'text-purple-600' }
  ];

  if (isLoading) {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Creator Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.full_name}! Manage your content and engage with your audience.
            </p>
          </div>
          <Badge variant="default" className="px-3 py-1">
            Creator
          </Badge>
        </div>

        {/* Content Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myBlogs}</div>
              <p className="text-xs text-muted-foreground">Published articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myVideos}</div>
              <p className="text-xs text-muted-foreground">Video content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myTemplates}</div>
              <p className="text-xs text-muted-foreground">Design templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myProducts}</div>
              <p className="text-xs text-muted-foreground">Marketplace items</p>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Content engagement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Community discussions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFollowers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Your audience</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Content</CardTitle>
            <CardDescription>
              Start creating amazing content for your audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
                  asChild
                >
                  <Link to={action.href}>
                    <action.icon className={`h-8 w-8 ${action.color}`} />
                    <span className="font-medium">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Overview</CardTitle>
              <CardDescription>Manage your published content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Blog Posts</p>
                      <p className="text-sm text-muted-foreground">{stats.myBlogs} published</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/blogs">Manage</Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Videos</p>
                      <p className="text-sm text-muted-foreground">{stats.myVideos} uploaded</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/videos">Manage</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace</CardTitle>
              <CardDescription>Your products and templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Templates</p>
                      <p className="text-sm text-muted-foreground">{stats.myTemplates} available</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/templates">Manage</Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Products</p>
                      <p className="text-sm text-muted-foreground">{stats.myProducts} listed</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/marketplace">Manage</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
