
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PlatformStats } from "@/components/owner/PlatformStats";
import { CreateAnnouncementDialog } from "@/components/owner/CreateAnnouncementDialog";
import { EmailCampaignDialog } from "@/components/owner/EmailCampaignDialog";
import { UserActivityLogs } from "@/components/owner/UserActivityLogs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  ShieldCheck, 
  Bell,
  Settings,
  UserPlus,
  MessageSquare,
  BarChart3
} from "lucide-react";

const OwnerDashboard = () => {
  const { userProfile } = useAuth();

  console.log('OwnerDashboard render:', { userProfile: !!userProfile });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.full_name}! Manage your CloudScribe platform.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
              Platform Owner
            </span>
          </div>
        </div>

        {/* Platform Statistics */}
        <PlatformStats />

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                View and manage all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/owner/users">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/owner/admins">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Manage Creators
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Admin Requests
              </CardTitle>
              <CardDescription>
                Review creator access requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/owner/requests">
                  <Bell className="mr-2 h-4 w-4" />
                  Review Requests
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communications
              </CardTitle>
              <CardDescription>
                Announcements and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <CreateAnnouncementDialog />
                <EmailCampaignDialog />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Management */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Blogs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/owner/blogs">Manage Blogs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/owner/videos">Manage Videos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/owner/templates">Manage Templates</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/owner/marketplace">Manage Products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs */}
        <UserActivityLogs />

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>
              Configure platform-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/owner/settings">
                <Settings className="mr-2 h-4 w-4" />
                Platform Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
