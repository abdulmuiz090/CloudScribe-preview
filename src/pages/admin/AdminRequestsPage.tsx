import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AdminRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
    profile_image_url?: string;
  };
}

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // First get admin requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('admin_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Then get user profiles for each request
      const requestsWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, email, profile_image_url')
            .eq('id', request.user_id)
            .single();
          
          return {
            ...request,
            user_profiles: profile
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load admin requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('process_admin_request', {
        request_id: requestId,
        new_status: newStatus,
        admin_id: user.id
      });

      if (error) throw error;

      await fetchRequests();
      toast({
        title: "Success",
        description: `Request ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Requests</h1>
              <p className="text-muted-foreground">Manage user requests to become administrators</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No admin requests</h3>
                <p className="text-muted-foreground">
                  There are currently no pending admin requests to review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {request.user_profiles?.full_name || 'Unknown User'}
                      </CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Email: {request.user_profiles?.email || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(request.created_at).toLocaleString()}
                          </p>
                          {request.status !== 'pending' && (
                            <p className="text-sm text-muted-foreground">
                              Updated: {new Date(request.updated_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRequest(request.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRequest(request.id, 'rejected')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </DashboardLayout>
  );
};

export default AdminRequestsPage;