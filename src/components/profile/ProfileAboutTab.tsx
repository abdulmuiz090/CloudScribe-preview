
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/database.types';
import { Mail, MessageCircle, Star, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileAboutTabProps {
  profile: UserProfile;
}

export const ProfileAboutTab = ({ profile }: ProfileAboutTabProps) => {
  const isAdmin = profile.role === 'admin' || profile.role === 'super-admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main About Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.bio ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No bio available yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Services Offered (for Admins) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">UI/UX Design</Badge>
                    <Badge variant="secondary">Frontend Development</Badge>
                    <Badge variant="secondary">Brand Strategy</Badge>
                    <Badge variant="secondary">Content Creation</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Available For</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Freelance Projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span>Consulting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                      <span>Long-term Partnerships</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testimonials */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">
                    "Exceptional work quality and professional communication. Delivered exactly what we needed on time."
                  </p>
                  <p className="text-xs text-muted-foreground">— Sarah Johnson, Startup Founder</p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">
                    "Creative solutions and great attention to detail. Highly recommend for any design project."
                  </p>
                  <p className="text-xs text-muted-foreground">— Michael Chen, Product Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm font-medium">
                {format(new Date(profile.created_at), 'MMM yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile Views</span>
              <span className="text-sm font-medium">1.2k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="text-sm font-medium">98%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Response Time</span>
              <span className="text-sm font-medium">2 hours</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">Published new post</span>
                <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground">Added new product</span>
                <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <span className="text-muted-foreground">Joined community</span>
                <span className="text-xs text-muted-foreground ml-auto">3d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
