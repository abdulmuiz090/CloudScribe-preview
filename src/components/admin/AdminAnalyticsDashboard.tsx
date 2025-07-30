
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Video, Package, ShoppingCart, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { getPlatformStats } from '@/lib/api';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PlatformStats {
  total_users: number;
  total_admins: number;
  total_blogs: number;
  published_blogs: number;
  total_videos: number;
  published_videos: number;
  total_templates: number;
  published_templates: number;
  total_products: number;
  published_products: number;
  pending_feedback: number;
  pending_admin_requests: number;
}

export const AdminAnalyticsDashboard = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getPlatformStats();
      // Type cast the JSON response to PlatformStats via unknown
      setStats(data as unknown as PlatformStats);
    } catch (error) {
      handleError(error, { title: 'Failed to load platform statistics' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load statistics</p>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Admin Users',
      value: stats.total_admins,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Published Blogs',
      value: `${stats.published_blogs}/${stats.total_blogs}`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Published Videos',
      value: `${stats.published_videos}/${stats.total_videos}`,
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Published Templates',
      value: `${stats.published_templates}/${stats.total_templates}`,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Published Products',
      value: `${stats.published_products}/${stats.total_products}`,
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Pending Feedback',
      value: stats.pending_feedback,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      badge: stats.pending_feedback > 0 ? 'attention' : undefined,
    },
    {
      title: 'Admin Requests',
      value: stats.pending_admin_requests,
      icon: AlertCircle,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      badge: stats.pending_admin_requests > 0 ? 'urgent' : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Platform Analytics</h2>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </div>
                {metric.badge && (
                  <Badge 
                    variant={metric.badge === 'urgent' ? 'destructive' : 'default'}
                    className="absolute -top-2 -right-2"
                  >
                    !
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Content Publishing Rates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Blogs:</span>
                  <span>{stats.total_blogs > 0 ? Math.round((stats.published_blogs / stats.total_blogs) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Videos:</span>
                  <span>{stats.total_videos > 0 ? Math.round((stats.published_videos / stats.total_videos) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Templates:</span>
                  <span>{stats.total_templates > 0 ? Math.round((stats.published_templates / stats.total_templates) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span>{stats.total_products > 0 ? Math.round((stats.published_products / stats.total_products) * 100) : 0}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Action Items</h4>
              <div className="space-y-2">
                {stats.pending_admin_requests > 0 && (
                  <div className="flex items-center gap-2 text-pink-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{stats.pending_admin_requests} admin request{stats.pending_admin_requests !== 1 ? 's' : ''} pending</span>
                  </div>
                )}
                {stats.pending_feedback > 0 && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <MessageSquare className="h-4 w-4" />
                    <span>{stats.pending_feedback} feedback item{stats.pending_feedback !== 1 ? 's' : ''} to review</span>
                  </div>
                )}
                {stats.pending_admin_requests === 0 && stats.pending_feedback === 0 && (
                  <div className="text-green-600">
                    All caught up! No pending actions.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
