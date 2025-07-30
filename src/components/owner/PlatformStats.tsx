import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BarChart3, 
  ShoppingCart, 
  Bell, 
  Activity,
  TrendingUp,
  FileText,
  Video,
  Megaphone
} from "lucide-react";

interface PlatformStats {
  total_users: number;
  active_users: number;
  regular_users: number;
  admin_users: number;
  super_admin_users: number;
  total_content: number;
  published_content: number;
  total_products: number;
  published_products: number;
  pending_admin_requests: number;
  total_announcements: number;
  published_announcements: number;
  email_campaigns: number;
  recent_activity: number;
}

export const PlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      console.log('Fetching platform statistics...');
      const { data, error } = await supabase.rpc('get_platform_stats');
      
      if (error) {
        console.error('Error fetching platform stats:', error);
        throw error;
      }

      console.log('Platform stats fetched:', data);
      // Type cast the Json response to our PlatformStats interface
      setStats(data as unknown as PlatformStats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load platform statistics."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load platform statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      description: `${stats.active_users} active in last 30 days`,
      color: "text-blue-600"
    },
    {
      title: "Admin Users",
      value: stats.admin_users + stats.super_admin_users,
      icon: Activity,
      description: `${stats.admin_users} creators, ${stats.super_admin_users} super-admins`,
      color: "text-purple-600"
    },
    {
      title: "Total Content",
      value: stats.total_content,
      icon: BarChart3,
      description: `${stats.published_content} published`,
      color: "text-green-600"
    },
    {
      title: "Products",
      value: stats.total_products,
      icon: ShoppingCart,
      description: `${stats.published_products} published`,
      color: "text-orange-600"
    },
    {
      title: "Pending Requests",
      value: stats.pending_admin_requests,
      icon: Bell,
      description: "Admin access requests",
      color: "text-red-600"
    },
    {
      title: "Announcements",
      value: stats.total_announcements,
      icon: Megaphone,
      description: `${stats.published_announcements} published`,
      color: "text-indigo-600"
    },
    {
      title: "Email Campaigns",
      value: stats.email_campaigns,
      icon: FileText,
      description: "Total campaigns created",
      color: "text-teal-600"
    },
    {
      title: "Recent Activity",
      value: stats.recent_activity,
      icon: TrendingUp,
      description: "Actions in last 24h",
      color: "text-pink-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
