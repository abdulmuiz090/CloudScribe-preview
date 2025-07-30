import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileOptimizedHeader } from '@/components/layout/MobileOptimizedHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Users, MessageSquare, ShoppingBag, Star, Zap, Globe, Shield } from 'lucide-react';

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
      setRedirectTimeout(null);
    }

    // Don't redirect while loading
    if (isLoading) {
      console.log('🏠 Index: Auth loading...');
      return;
    }

    // Only redirect authenticated users
    if (user) {
      console.log('🏠 Index: Authenticated user detected, redirecting...', { userRole });
      
      // Check onboarding status
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      
      if (!hasCompletedOnboarding) {
        console.log('🏠 Index: Redirecting to onboarding');
        const timeout = setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 100);
        setRedirectTimeout(timeout);
        return;
      }

      // Route based on user role with a small delay to prevent conflicts
      const timeout = setTimeout(() => {
        if (userRole === 'super-admin') {
          console.log('🏠 Index: Redirecting super-admin to owner dashboard');
          navigate('/owner', { replace: true });
        } else if (userRole === 'admin') {
          console.log('🏠 Index: Redirecting admin to admin dashboard');
          navigate('/admin', { replace: true });
        } else {
          console.log('🏠 Index: Redirecting user to dashboard');
          navigate('/dashboard', { replace: true });
        }
      }, 200);
      setRedirectTimeout(timeout);
    }

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [user, userRole, isLoading, navigate]);

  useEffect(() => {
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [redirectTimeout]);

  // Show loading while auth is being determined
  if (isLoading) {
    console.log('🏠 Index: Auth loading...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading CloudScribe...</p>
        </div>      
      </div>
    );
  }

  // If user is authenticated, show loading while preparing redirect
  if (user) {
    console.log('🏠 Index: User authenticated, preparing redirect...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('🏠 Index: Showing landing page for unauthenticated user');

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Content Creation",
      description: "Share posts, blogs, and videos with your audience"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Communities",
      description: "Build and manage thriving communities"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Marketplace",
      description: "Sell products and templates directly to users"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Chat",
      description: "Connect instantly with your community"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      content: "CloudScribe has transformed how I connect with my audience and monetize my content.",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Community Builder",
      content: "The community features are incredible. I've grown my audience by 300% in just 3 months.",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Digital Entrepreneur",
      content: "Finally, a platform that lets me do everything in one place - content, community, and commerce.",
      avatar: "ER"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MobileOptimizedHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              🚀 Now in Public Beta
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your All-in-One{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Creator Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build your audience, create communities, sell products, and connect with your fans - all in one powerful platform designed for modern creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From content creation to community building and monetization, CloudScribe provides all the tools you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Creators</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500K+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">$2M+</div>
              <div className="text-muted-foreground">Creator Earnings</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of creators who are already building their success on CloudScribe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Creator Journey?
              </CardTitle>
              <CardDescription className="text-xl mb-8 max-w-2xl mx-auto">
                Join CloudScribe today and get access to all the tools you need to build, engage, and monetize your audience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8">
                  <Link to="/signup">
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link to="/login">Already have an account?</Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Free to start
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Global reach
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Instant setup
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 font-bold text-xl mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                  CS
                </div>
                CloudScribe
              </Link>
              <p className="text-muted-foreground">
                The ultimate platform for creators to build, engage, and monetize their audience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/templates" className="hover:text-foreground">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CloudScribe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
