
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminRequests,
  updateAdminRequestStatus
} from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AdminRequest = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_profiles: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  };
};

const AdminRequestsPage = () => {
  const { toast } = useToast();
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const fetchAdminRequests = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching admin requests...');
      const requests = await getAdminRequests();
      
      if (!Array.isArray(requests)) {
        console.error('Invalid response format for admin requests:', requests);
        throw new Error('Failed to load admin requests: Invalid response format');
      }
      
      console.log('Admin requests data received:', requests);
      setAdminRequests(requests as AdminRequest[]);
      
      // Count pending requests
      const pendingCount = requests.filter((request: any) => request.status === 'pending').length;
      setPendingRequestsCount(pendingCount);
      
      console.log(`Found ${pendingCount} pending requests out of ${requests.length} total requests`);
    } catch (error: any) {
      console.error('Error fetching admin requests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load admin requests. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Updating request ${requestId} to ${status}...`);
      const updatedRequest = await updateAdminRequestStatus(requestId, status);
      console.log('Request updated:', updatedRequest);
      
      // Update local state
      setAdminRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status } 
            : request
        )
      );
      
      // Update pending count if it was pending
      const wasRequestPending = adminRequests.find(req => req.id === requestId)?.status === 'pending';
      if (wasRequestPending) {
        setPendingRequestsCount(prev => prev - 1);
      }
      
      const actionText = status === 'approved' ? 'approved' : 'rejected';
      toast({
        title: `Request ${actionText}`,
        description: `The admin request has been ${actionText}.`,
        variant: status === 'approved' ? 'default' : 'destructive'
      });
    } catch (error: any) {
      console.error(`Error ${status} request:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${status} the request. Please try again.`
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Requests</h2>
          <p className="text-muted-foreground">
            Manage requests for admin access to the platform
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Requests</CardTitle>
            <CardDescription>
              {pendingRequestsCount === 0 
                ? "No pending requests at the moment"
                : `${pendingRequestsCount} pending ${pendingRequestsCount === 1 ? 'request' : 'requests'} to review`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : adminRequests.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center flex-col">
                <Bell className="h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No admin requests</p>
                <p className="text-sm text-muted-foreground">When users request admin access, they will appear here for review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminRequests.map((request) => (
                  <Card key={request.id} className={request.status === 'pending' ? 'border-primary' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={request.user_profiles?.profile_image_url || ''} />
                            <AvatarFallback>{(request.user_profiles?.full_name || '').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.user_profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{request.user_profiles?.email}</p>
                          </div>
                        </div>
                        <div>
                          {request.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                          )}
                          {request.status === 'approved' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved</span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-0">
                      <p className="text-sm text-muted-foreground">
                        Requested on {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                    {request.status === 'pending' && (
                      <CardFooter className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive border-destructive" 
                          onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminRequestsPage;
