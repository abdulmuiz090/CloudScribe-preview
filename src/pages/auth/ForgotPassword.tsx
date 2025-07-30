
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 hidden lg:block bg-brand">
          <div className="flex items-center justify-center h-full p-8">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-6">Check Your Email</h1>
              <p className="text-xl text-white/80">
                We've sent you a password reset link. Please check your email and click the link to reset your password.
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <Link to="/" className="text-2xl font-bold">CloudScribe</Link>
              <h1 className="text-3xl font-bold mt-6">Email Sent!</h1>
              <p className="text-muted-foreground mt-2">
                Check your email for a password reset link
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Try Again
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 hidden lg:block bg-brand">
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6">Reset Password</h1>
            <p className="text-xl text-white/80">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold">CloudScribe</Link>
            <h1 className="text-3xl font-bold mt-6">Forgot Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Remember your password?</span>{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
