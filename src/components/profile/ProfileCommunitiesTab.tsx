
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Community } from '@/types/database.types';
import { Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileCommunitiesTabProps {
  userId: string;
}

export const ProfileCommunitiesTab = ({ userId }: ProfileCommunitiesTabProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, [userId]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('admin_id', userId)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {communities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No communities created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              {/* Banner */}
              <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-r from-purple-500 to-pink-500">
                {community.banner_url ? (
                  <img 
                    src={community.banner_url} 
                    alt={community.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Topic Badge */}
                  {community.topic && (
                    <Badge variant="outline" className="text-xs">
                      {community.topic}
                    </Badge>
                  )}

                  {/* Community Info */}
                  <div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">
                      {community.name}
                    </h3>
                    {community.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {community.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {community.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{community.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{community.members_count || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(community.created_at), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button size="sm" className="w-full" variant="outline">
                    View Community
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
