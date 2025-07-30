
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createCommunity } from '@/lib/communities-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateCommunityDialogProps {
  onCommunityCreated: () => void;
}

export function CreateCommunityDialog({ onCommunityCreated }: CreateCommunityDialogProps) {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    banner_url: '',
    tags: [] as string[],
    newTag: '',
  });

  const canCreateCommunities = userRole === 'admin' || userRole === 'super-admin';

  if (!canCreateCommunities) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Community name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createCommunity({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        topic: formData.topic.trim() || undefined,
        banner_url: formData.banner_url.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });

      toast({
        title: "Success",
        description: "Community created successfully!",
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        topic: '',
        banner_url: '',
        tags: [],
        newTag: '',
      });
      
      setOpen(false);
      onCommunityCreated();
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    const tag = formData.newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        newTag: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Build a space where people can connect around shared interests.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="Enter community name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your community..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Technology, Design, Business"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_url">Banner Image URL</Label>
            <Input
              id="banner_url"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={formData.banner_url}
              onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag and press Enter"
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                onKeyPress={handleTagKeyPress}
              />
              <Button type="button" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Community
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
