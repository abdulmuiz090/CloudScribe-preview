
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Ban, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateUserRole } from "@/lib/api";

interface Admin {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  profile_image_url: string | null;
}

const AdminManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real admin users from Supabase
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .in('role', ['admin', 'super-admin']);

        if (error) {
          throw error;
        }

        console.log('Fetched admins:', data);
        setAdmins(data);
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin users. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [toast]);

  const filteredAdmins = admins.filter(admin => 
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDemoteAdmin = async (adminId: string) => {
    try {
      await updateUserRole(adminId, 'user');
      
      // Update local state
      setAdmins(admins.filter(admin => admin.id !== adminId));
      
      toast({
        title: "Admin demoted",
        description: "The admin has been demoted to a regular user.",
      });
    } catch (error) {
      console.error('Error demoting admin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to demote admin. Please try again."
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
            <p className="text-muted-foreground">
              Manage administrator accounts and permissions
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>
                  Total of {admins.length} administrators
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-2 p-4 border-b bg-muted/50">
                  <div className="col-span-4 font-medium">Admin</div>
                  <div className="col-span-3 font-medium">Email</div>
                  <div className="col-span-3 font-medium">Date Promoted</div>
                  <div className="col-span-2 font-medium text-right">Actions</div>
                </div>
                
                <div className="divide-y">
                  {filteredAdmins.map((admin) => (
                    <div key={admin.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                      <div className="col-span-4 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.profile_image_url || ''} />
                          <AvatarFallback>{admin.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{admin.full_name}</span>
                      </div>
                      <div className="col-span-3 text-muted-foreground">{admin.email}</div>
                      <div className="col-span-3">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                      <div className="col-span-2 text-right">
                        {admin.role !== 'super-admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDemoteAdmin(admin.id)} className="cursor-pointer">
                                <Ban className="mr-2 h-4 w-4" />
                                Demote to User
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem className="cursor-pointer text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminManagementPage;
