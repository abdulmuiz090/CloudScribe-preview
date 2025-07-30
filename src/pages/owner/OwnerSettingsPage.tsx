
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmailCampaignManagement } from "@/components/owner/EmailCampaignManagement";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const OwnerSettingsPage = () => {
  const { toast } = useToast();
  const [stripeConnected, setStripeConnected] = useState(false);
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "The system settings have been updated successfully."
    });
  };

  const connectStripe = () => {
    // This would typically open Stripe Connect onboarding
    setStripeConnected(true);
    toast({
      title: "Stripe Connected",
      description: "Your Stripe account has been successfully connected."
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure platform-wide settings and behavior
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="email">Email Campaigns</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage basic platform configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="CloudScribe" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Input id="site-description" defaultValue="A modern content management platform" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@cloudscribe.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options for your platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="2fa" className="flex flex-col space-y-1">
                    <span>Require 2FA for admins</span>
                    <span className="font-normal text-sm text-muted-foreground">All administrators must use two-factor authentication</span>
                  </Label>
                  <Switch id="2fa" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="password-policy" className="flex flex-col space-y-1">
                    <span>Strong Password Policy</span>
                    <span className="font-normal text-sm text-muted-foreground">Require complex passwords from all users</span>
                  </Label>
                  <Switch id="password-policy" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Security Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Settings</CardTitle>
                <CardDescription>
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="blogs-enabled" className="flex flex-col space-y-1">
                    <span>Blog Feature</span>
                    <span className="font-normal text-sm text-muted-foreground">Enable blog functionality</span>
                  </Label>
                  <Switch id="blogs-enabled" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketplace-enabled" className="flex flex-col space-y-1">
                    <span>Marketplace</span>
                    <span className="font-normal text-sm text-muted-foreground">Enable marketplace functionality</span>
                  </Label>
                  <Switch id="marketplace-enabled" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="templates-enabled" className="flex flex-col space-y-1">
                    <span>Templates</span>
                    <span className="font-normal text-sm text-muted-foreground">Enable template functionality</span>
                  </Label>
                  <Switch id="templates-enabled" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="videos-enabled" className="flex flex-col space-y-1">
                    <span>Videos</span>
                    <span className="font-normal text-sm text-muted-foreground">Enable video functionality</span>
                  </Label>
                  <Switch id="videos-enabled" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Feature Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment processing and wallet options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="paystack-enabled" className="flex flex-col space-y-1">
                    <span>Paystack Payments</span>
                    <span className="font-normal text-sm text-muted-foreground">Enable Paystack payment processing</span>
                  </Label>
                  <Switch id="paystack-enabled" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction-fee">Platform Transaction Fee (%)</Label>
                  <Input id="transaction-fee" type="number" defaultValue="10" min="0" max="100" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min-withdrawal">Minimum Withdrawal Amount (₦)</Label>
                  <Input id="min-withdrawal" type="number" defaultValue="100" min="0" />
                </div>
                
                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                  <h3 className="font-medium">Paystack Integration</h3>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Paystack API connected (Test Mode)</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Test Public Key: pk_test_7093255123fa05...</p>
                      <p>Secret Key: Configured in Supabase Secrets</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Paystack Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Payment Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <EmailCampaignManagement />
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Settings</CardTitle>
                <CardDescription>
                  Manage system maintenance and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                    <span>Maintenance Mode</span>
                    <span className="font-normal text-sm text-muted-foreground">Put site in maintenance mode</span>
                  </Label>
                  <Switch id="maintenance-mode" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Input id="maintenance-message" defaultValue="We're currently performing scheduled maintenance. Please check back soon." />
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="mr-2">Backup Database</Button>
                  <Button variant="outline">Clear Cache</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Maintenance Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSettingsPage;
