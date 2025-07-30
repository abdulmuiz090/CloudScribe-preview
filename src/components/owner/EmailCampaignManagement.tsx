
/**
 * Email Campaign Management Component
 * Purpose: Manage email campaigns with Resend integration
 * Features: Create, view, send, and track email campaigns
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailCampaignDialog } from './EmailCampaignDialog';
import { CreateAnnouncementDialog } from './CreateAnnouncementDialog';
import { Mail, Send, Users, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  recipient_count: number;
  delivered_count: number;
  created_at: string;
  sent_at: string | null;
  template_type: string;
}

export const EmailCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedCampaigns: EmailCampaign[] = (data || []).map(campaign => ({
        ...campaign,
        status: campaign.status as 'draft' | 'sending' | 'sent' | 'failed',
        recipient_count: campaign.recipient_count || 0,
        delivered_count: campaign.delivered_count || 0
      }));
      
      setCampaigns(typedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch email campaigns.",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      setSendingCampaign(campaignId);
      
      const { data, error } = await supabase.functions.invoke('send-email-campaign', {
        body: { campaign_id: campaignId }
      });

      if (error) throw error;

      toast({
        title: "Campaign Sent",
        description: `Successfully sent to ${data.delivered} out of ${data.total} recipients.`,
      });

      fetchCampaigns(); // Refresh the list
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Failed to send email campaign.",
      });
    } finally {
      setSendingCampaign(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sending':
        return <Badge variant="default">Sending</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-green-500">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Email Campaigns</h3>
          <p className="text-sm text-muted-foreground">
            Send email campaigns to all platform users
          </p>
        </div>
        <div className="flex gap-2">
          <CreateAnnouncementDialog onAnnouncementCreated={fetchCampaigns} />
          <EmailCampaignDialog onCampaignCreated={fetchCampaigns} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Campaign Management
          </CardTitle>
          <CardDescription>
            Create and manage email campaigns for your platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first email campaign to engage with your users.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.subject}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(campaign.status)}
                        {getStatusBadge(campaign.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.recipient_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.status === 'sent' ? campaign.delivered_count : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => sendCampaign(campaign.id)}
                          disabled={sendingCampaign === campaign.id}
                          className="flex items-center gap-1"
                        >
                          {sendingCampaign === campaign.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Send
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
