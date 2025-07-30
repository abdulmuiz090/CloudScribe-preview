
import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Please enter your password.',
  }),
  rememberMe: z.boolean().default(false),
});

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Check if user just signed up and show welcome toast only once
  useEffect(() => {
    const isNewUser = location.state?.newUser;
    if (isNewUser && !hasShownWelcome) {
      toast({
        title: "Welcome to CloudScribe!",
        description: "Please sign in with your new account.",
      });
      setHasShownWelcome(true);
      // Clear the state to prevent showing the toast again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, hasShownWelcome, toast, navigate, location.pathname]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await signInWithEmail(values.email, values.password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in with Google. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        Continue with Google
      </Button>
    </div>
  );
};
