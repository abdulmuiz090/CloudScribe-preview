
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

const adminRequestSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
  experience: z.string().min(5, 'Please describe your experience'),
  skills: z.string().min(5, 'Please list your relevant skills'),
});

type AdminRequestForm = z.infer<typeof adminRequestSchema>;

export const AdminRequestForm = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  const form = useForm<AdminRequestForm>({
    resolver: zodResolver(adminRequestSchema),
    defaultValues: {
      reason: '',
      experience: '',
      skills: '',
    },
  });

  // Check existing request status
  useState(() => {
    const checkRequestStatus = async () => {
      if (!userProfile?.id) return;

      const { data, error } = await supabase
        .from('admin_requests')
        .select('status')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setRequestStatus(data.status as 'pending' | 'approved' | 'rejected');
      }
    };

    checkRequestStatus();
  });

  const onSubmit = async (data: AdminRequestForm) => {
    if (!userProfile?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to request admin access.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('admin_requests')
        .insert({
          user_id: userProfile.id,
          status: 'pending'
        });

      if (error) throw error;

      // Also insert into feedback table for additional context
      await supabase
        .from('feedback')
        .insert({
          user_id: userProfile.id,
          type: 'admin_request',
          content: `Admin Request:
Reason: ${data.reason}
Experience: ${data.experience}
Skills: ${data.skills}`,
          status: 'pending'
        });

      setRequestStatus('pending');
      toast({
        title: 'Request Submitted',
        description: 'Your admin request has been submitted and will be reviewed by a super admin.',
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting admin request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit admin request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestStatus === 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Admin Request Pending
          </CardTitle>
          <CardDescription>Your request is being reviewed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
            </div>
            <p className="text-muted-foreground">
              Your admin request is currently being reviewed by a super admin. We'll notify you once a decision has been made.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requestStatus === 'approved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Admin Request Approved
          </CardTitle>
          <CardDescription>Congratulations! You now have admin access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 dark:text-green-400 h-6 w-6" />
            </div>
            <p className="text-muted-foreground">
              Your admin request has been approved. You now have admin privileges and can access admin features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requestStatus === 'rejected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Admin Request Rejected
          </CardTitle>
          <CardDescription>Your request was not approved at this time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-600 dark:text-red-400 h-6 w-6" />
            </div>
            <p className="text-muted-foreground mb-4">
              Your admin request was not approved. You can submit a new request if circumstances have changed.
            </p>
            <Button
              variant="outline"
              onClick={() => setRequestStatus('none')}
            >
              Submit New Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Admin Access</CardTitle>
        <CardDescription>
          Fill out this form to request admin privileges. Your request will be reviewed by a super admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Admin Access</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you need admin access and how you plan to use it..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your experience with content management, community moderation, or similar roles..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Skills</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Content Creation, Community Management, Technical Writing..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Admin Request'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
