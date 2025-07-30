
import { useQuery } from '@tanstack/react-query';
import { getFeedItems, getPersonalizedFeed } from '@/lib/feed';
import { FeedItem } from './FeedItem';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Feed() {
  const { data: allFeedItems, isLoading: allLoading } = useQuery({
    queryKey: ['feed', 'all'],
    queryFn: () => getFeedItems(50),
  });

  const { data: personalizedFeedItems, isLoading: personalizedLoading } = useQuery({
    queryKey: ['feed', 'personalized'],
    queryFn: () => getPersonalizedFeed(50),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="personalized" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personalized">Following</TabsTrigger>
          <TabsTrigger value="all">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="mt-6">
          {personalizedLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : personalizedFeedItems?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Follow some admins to see their content here!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {personalizedFeedItems?.map((item) => (
                <FeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {allLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {allFeedItems?.map((item) => (
                <FeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
