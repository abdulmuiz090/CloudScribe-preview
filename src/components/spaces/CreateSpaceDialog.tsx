
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createSpace } from '@/lib/spaces-api';
import { Plus } from 'lucide-react';

interface CreateSpaceDialogProps {
  onSpaceCreated?: () => void;
}

export function CreateSpaceDialog({ onSpaceCreated }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_url: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Space name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createSpace({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        banner_url: formData.banner_url.trim() || undefined
      });
      
      toast({
        title: "Success",
        description: "Space created successfully!",
      });
      
      setOpen(false);
      setFormData({ name: '', description: '', banner_url: '' });
      onSpaceCreated?.();
    } catch (error: any) {
      console.error('Error creating space:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create space.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Space</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Space Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter space name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your space..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="banner_url">Banner Image URL</Label>
            <Input
              id="banner_url"
              type="url"
              value={formData.banner_url}
              onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
              placeholder="https://example.com/banner.jpg"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Space'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
