
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateUserProfile } from '@/lib/profile-api';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/database.types';
import { Twitter, Instagram, Github, Globe, Linkedin } from 'lucide-react';

const socialLinksSchema = z.object({
  twitter: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;

interface SocialLinksEditDialogProps {
  profile: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (profile: UserProfile) => void;
}

export const SocialLinksEditDialog = ({
  profile,
  open,
  onOpenChange,
  onUpdate
}: SocialLinksEditDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      twitter: profile.social_links?.twitter || '',
      instagram: profile.social_links?.instagram || '',
      github: profile.social_links?.github || '',
      linkedin: profile.social_links?.linkedin || '',
      website: profile.social_links?.website || '',
    },
  });

  const onSubmit = async (data: SocialLinksFormValues) => {
    setIsLoading(true);
    try {
      // Filter out empty strings
      const social_links = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '')
      );

      const updatedProfile = await updateUserProfile(profile.id, {
        social_links,
      });

      onUpdate(updatedProfile);
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Social links updated successfully',
      });
    } catch (error) {
      console.error('Error updating social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to update social links',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const socialPlatforms = [
    { name: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { name: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
    { name: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { name: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { name: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Social Links</DialogTitle>
          <DialogDescription>
            Add your social media profiles and website links.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {socialPlatforms.map((platform) => (
              <FormField
                key={platform.name}
                control={form.control}
                name={platform.name as keyof SocialLinksFormValues}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <platform.icon className="h-4 w-4" />
                      {platform.label}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={platform.placeholder}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Links'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
