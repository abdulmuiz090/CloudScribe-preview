import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Star, 
  MessageSquare,
  Eye,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminMetrics {
  totalFollowers: number;
  contentCreated: number;
  productsCount: number;
  walletBalance: number;
  customersCount: number;
  topRatedProduct: {
    name: string;
    rating: number;
    sales: number;
  } | null;
  contentEngagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: number;
  };
  recentFeedback: Array<{
    id: string;
    content: string;
    rating: number;
    created_at: string;
    product_name?: string;
  }>;
}

export const AdminMetrics = () => {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalFollowers: 0,
    contentCreated: 0,
    productsCount: 0,
    walletBalance: 0,
    customersCount: 0,
    topRatedProduct: null,
    contentEngagement: {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      engagementRate: 0
    },
    recentFeedback: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchAdminMetrics();
    }
  }, [userProfile]);

  const fetchAdminMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-admin-metrics');
      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Your audience reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.productsCount}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.walletBalance)}</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customersCount}</div>
            <p className="text-xs text-muted-foreground">Unique buyers</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Engagement */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contentEngagement.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contentEngagement.totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contentEngagement.totalComments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contentEngagement.engagementRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Product & Recent Feedback */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Rated Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topRatedProduct ? (
              <div className="space-y-2">
                <h3 className="font-semibold">{metrics.topRatedProduct.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {metrics.topRatedProduct.rating.toFixed(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {metrics.topRatedProduct.sales} sales
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No rated products yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentFeedback.slice(0, 3).map((feedback) => (
                  <div key={feedback.id} className="border-l-2 border-muted pl-3">
                    <p className="text-sm line-clamp-2">{feedback.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {feedback.rating}/5
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No feedback yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
