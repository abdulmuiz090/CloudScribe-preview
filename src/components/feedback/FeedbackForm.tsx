
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackFormProps {
  adminId?: string;
  onFeedbackSent?: () => void;
}

export const FeedbackForm = ({ adminId, onFeedbackSent }: FeedbackFormProps) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const feedbackTypes = [
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'general', label: 'General Feedback' },
    { value: 'support', label: 'Support Request' },
  ];

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !feedbackType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement feedback submission API
      console.log('Submitting feedback:', { 
        adminId, 
        feedbackType, 
        feedback, 
        userId: user.id 
      });
      
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback! We'll review it soon.",
      });
      
      setFeedback('');
      setFeedbackType('');
      onFeedbackSent?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Feedback Type *
          </label>
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger>
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Your Feedback *
          </label>
          <Textarea
            placeholder="Share your thoughts, suggestions, or report issues..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSubmitFeedback}
          disabled={isSubmitting || !feedback.trim() || !feedbackType}
          className="w-full"
        >
          {isSubmitting ? "Sending..." : "Send Feedback"}
        </Button>
      </CardContent>
    </Card>
  );
};
