
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity, User, Calendar } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export const UserActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load activity logs."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'role_promoted':
        return 'bg-green-100 text-green-800';
      case 'role_demoted':
        return 'bg-orange-100 text-orange-800';
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'content_created':
        return 'bg-purple-100 text-purple-800';
      case 'content_deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity logs found
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getActionBadgeColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      User ID: {log.user_id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs bg-muted p-2 rounded mt-2">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
