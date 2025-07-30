
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCommunity } from '@/lib/communities-api';
import type { Community } from '@/types/database.types';

const editCommunitySchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  description: z.string().optional(),
  topic: z.string().optional(),
  banner_url: z.string().url().optional().or(z.literal('')),
  published: z.boolean(),
});

type EditCommunityFormData = z.infer<typeof editCommunitySchema>;

interface EditCommunityDialogProps {
  community: Community;
  onCommunityUpdated: () => void;
}

export function EditCommunityDialog({ community, onCommunityUpdated }: EditCommunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(community.tags || []);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const form = useForm<EditCommunityFormData>({
    resolver: zodResolver(editCommunitySchema),
    defaultValues: {
      name: community.name,
      description: community.description || '',
      topic: community.topic || '',
      banner_url: community.banner_url || '',
      published: community.published,
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: EditCommunityFormData) => {
    setIsLoading(true);
    try {
      await updateCommunity(community.id, {
        name: data.name,
        description: data.description,
        topic: data.topic,
        banner_url: data.banner_url || null,
        tags: tags,
        published: data.published,
      });

      toast({
        title: "Community Updated",
        description: "Your community has been updated successfully.",
      });

      setOpen(false);
      onCommunityUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Community</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter community name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your community..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology, Art, Music..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banner_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/banner.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Published</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this community visible to others
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Community'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
