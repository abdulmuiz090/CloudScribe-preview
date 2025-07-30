
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

interface EmailCampaignDialogProps {
  onCampaignCreated?: () => void;
}

export const EmailCampaignDialog = ({ onCampaignCreated }: EmailCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    template_type: "general",
    scheduled_for: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get total user count for recipient count
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      const campaignData = {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        template_type: formData.template_type,
        scheduled_for: formData.scheduled_for || null,
        recipient_count: userCount || 0,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { error } = await supabase
        .from('email_campaigns')
        .insert(campaignData);

      if (error) throw error;

      toast({
        title: "Email Campaign Created",
        description: `Campaign "${formData.name}" has been created successfully.`,
      });

      setFormData({
        name: "",
        subject: "",
        content: "",
        template_type: "general",
        scheduled_for: ""
      });
      setOpen(false);
      onCampaignCreated?.();
    } catch (error) {
      console.error('Error creating email campaign:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create email campaign. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Create Email Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <DialogDescription>
            Create an email campaign to send to all platform users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter campaign name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter email subject"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter email content"
                rows={6}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template_type">Template Type</Label>
              <Select value={formData.template_type} onValueChange={(value) => setFormData({ ...formData, template_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduled_for">Schedule For (Optional)</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
