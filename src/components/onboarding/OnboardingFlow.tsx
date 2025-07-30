
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Sparkles, Users, MessageSquare, ShoppingBag } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to CloudScribe!',
      description: 'Your all-in-one creator platform for content, products, and community building.',
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      completed: false,
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your bio, profile picture, and social links to get discovered.',
      icon: <Users className="h-8 w-8 text-primary" />,
      completed: false,
    },
    {
      id: 'explore',
      title: 'Explore Features',
      description: 'Discover posts, communities, marketplace, and chat features.',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      completed: false,
    },
    {
      id: 'create',
      title: 'Create Your First Content',
      description: 'Share a post, create a product, or start a community.',
      icon: <ShoppingBag className="h-8 w-8 text-primary" />,
      completed: false,
    },
  ]);

  const handleStepComplete = () => {
    const updatedSteps = [...steps];
    updatedSteps[currentStep].completed = true;
    setSteps(updatedSteps);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-2xl font-bold">
            {currentStepData.title}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {currentStepData.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Posts & Blogs</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Communities</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Marketplace</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Chat & Connect</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            <Button onClick={handleStepComplete}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
