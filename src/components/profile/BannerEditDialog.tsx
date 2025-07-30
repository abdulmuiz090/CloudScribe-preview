
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updateUserProfile, uploadBannerImage } from '@/lib/profile-api';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/database.types';
import { Upload, X } from 'lucide-react';

interface BannerEditDialogProps {
  profile: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (profile: UserProfile) => void;
}

export const BannerEditDialog = ({
  profile,
  open,
  onOpenChange,
  onUpdate
}: BannerEditDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSave = async () => {
    if (!bannerFile) return;

    setIsLoading(true);
    try {
      const banner_url = await uploadBannerImage(profile.id, bannerFile);
      const updatedProfile = await updateUserProfile(profile.id, { banner_url });

      onUpdate(updatedProfile);
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Banner updated successfully',
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update banner',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setIsLoading(true);
    try {
      const updatedProfile = await updateUserProfile(profile.id, { banner_url: null });
      onUpdate(updatedProfile);
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Banner removed successfully',
      });
    } catch (error) {
      console.error('Error removing banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove banner',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
          <DialogDescription>
            Upload a new banner image or remove the current one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Banner Preview */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
            {(previewUrl || profile.banner_url) && (
              <img 
                src={previewUrl || profile.banner_url || ''} 
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-white text-sm font-medium">Banner Preview</span>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Upload className="h-full w-full" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drop your banner image here, or{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1200x400px, PNG or JPG
                </p>
              </div>
            </div>
            
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {profile.banner_url && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveBanner}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove Banner
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!bannerFile || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Save Banner'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
