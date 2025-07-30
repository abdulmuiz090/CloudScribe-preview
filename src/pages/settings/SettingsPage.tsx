
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/hooks/use-theme';
import { AdminRequestForm } from '@/components/admin/AdminRequestForm';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe,
  UserCheck,
  Settings as SettingsIcon 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { userProfile, userRole } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load user preferences
  useEffect(() => {
    // In a real app, you'd load these from a user preferences table
    const savedPrefs = localStorage.getItem('user-preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setEmailNotifications(prefs.emailNotifications ?? true);
        setPushNotifications(prefs.pushNotifications ?? true);
        setPublicProfile(prefs.publicProfile ?? true);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Save preferences
  const savePreferences = async (updates: any) => {
    setLoading(true);
    try {
      const currentPrefs = {
        emailNotifications,
        pushNotifications,
        publicProfile,
        ...updates
      };
      
      localStorage.setItem('user-preferences', JSON.stringify(currentPrefs));
      
      // In a real app, you'd save to a database
      // await supabase.from('user_preferences').upsert({
      //   user_id: userProfile?.id,
      //   ...currentPrefs
      // });
      
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailNotificationsChange = (value: boolean) => {
    setEmailNotifications(value);
    savePreferences({ emailNotifications: value });
  };

  const handlePushNotificationsChange = (value: boolean) => {
    setPushNotifications(value);
    savePreferences({ pushNotifications: value });
  };

  const handlePublicProfileChange = (value: boolean) => {
    setPublicProfile(value);
    savePreferences({ publicProfile: value });
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
              <CardDescription>
                Your account information and current role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userProfile?.profile_image_url || ''} alt={userProfile?.full_name} />
                  <AvatarFallback className="text-lg">{userProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">{userProfile?.full_name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                    {userProfile?.username && (
                      <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeStyle(userRole || 'user')}>
                      {getRoleDisplayName(userRole || 'user')}
                    </Badge>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {userProfile?.status_tag && (
                    <Badge variant="outline">{userProfile.status_tag}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              {userRole === 'user' && <TabsTrigger value="admin-request">Admin Request</TabsTrigger>}
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={handleEmailNotificationsChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={handlePushNotificationsChange}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Privacy
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and visibility settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-profile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch
                      id="public-profile"
                      checked={publicProfile}
                      onCheckedChange={handlePublicProfileChange}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize how CloudScribe looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                          theme === 'light' 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background border-border hover:bg-accent'
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                          theme === 'dark' 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background border-border hover:bg-accent'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                          theme === 'system' 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background border-border hover:bg-accent'
                        }`}
                      >
                        System
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred theme or follow your system setting. Currently using: {actualTheme}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {userRole === 'user' && (
              <TabsContent value="admin-request">
                <AdminRequestForm />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
