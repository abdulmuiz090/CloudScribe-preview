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
import { 
  Users, 
  Search, 
  Trash2, 
  Ban, 
  ShieldCheck, 
  CheckCircle,
  XCircle,
  ChevronDown
} from "lucide-react";
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
import { UserProfile } from "@/types/database.types";
import { getUsers, updateUserRole, demoteUserToRegular } from "@/lib/api";

interface UserWithStatus extends UserProfile {
  status: 'active' | 'banned';
}

const UserManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await getUsers();

        // Transform the data to include a status property
        const usersWithStatus: UserWithStatus[] = data.map((user: UserProfile) => ({
          ...user,
          status: 'active' as const // Default status since it's not in the UserProfile type
        }));

        setUsers(usersWithStatus);
        console.log('Fetched users:', usersWithStatus);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId: string) => {
    toast({
      title: "User deleted",
      description: "The user has been successfully deleted.",
    });
  };

  const handleBanUser = (userId: string) => {
    toast({
      title: "User banned",
      description: "The user has been successfully banned.",
    });
  };

  const handleUnbanUser = (userId: string) => {
    toast({
      title: "User unbanned",
      description: "The user has been successfully unbanned.",
    });
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      setIsLoading(true);
      await updateUserRole(userId, 'admin');
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'admin' } 
          : user
      ));
      
      toast({
        title: "User promoted",
        description: "The user has been promoted to Admin.",
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to promote user. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoteToUser = async (userId: string) => {
    try {
      setIsLoading(true);
      await demoteUserToRegular(userId);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: 'user' } 
          : user
      ));
      
      toast({
        title: "User demoted",
        description: "The admin has been demoted to regular user.",
      });
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to demote user. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              Manage all user accounts on the platform
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Total of {users.length} registered users
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                  <div className="col-span-4 font-medium">User</div>
                  <div className="col-span-3 font-medium">Email</div>
                  <div className="col-span-2 font-medium">Role</div>
                  <div className="col-span-2 font-medium">Status</div>
                  <div className="col-span-1 font-medium text-right">Actions</div>
                </div>
                
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                      <div className="col-span-4 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_image_url || ''} />
                          <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.full_name}</span>
                      </div>
                      <div className="col-span-3 text-muted-foreground">{user.email}</div>
                      <div className="col-span-2">
                        {user.role === 'super-admin' && (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>
                        )}
                        {user.role === 'admin' && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
                        )}
                        {user.role === 'user' && (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">User</Badge>
                        )}
                      </div>
                      <div className="col-span-2">
                        {user.status === 'active' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                            Active
                          </Badge>
                        )}
                        {user.status === 'banned' && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                            Banned
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role !== 'super-admin' && (
                              <>
                                {user.role === 'user' ? (
                                  <DropdownMenuItem onClick={() => handlePromoteToAdmin(user.id)} className="cursor-pointer">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleDemoteToUser(user.id)} className="cursor-pointer">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Demote to User
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            
                            {user.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleBanUser(user.id)} className="cursor-pointer text-orange-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUnbanUser(user.id)} className="cursor-pointer text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Unban User
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="cursor-pointer text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default UserManagementPage;
