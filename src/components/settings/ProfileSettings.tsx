import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Save } from 'lucide-react';

export const ProfileSettings = () => {
  const { userProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    username: userProfile?.username || '',
    bio: userProfile?.bio || '',
    status_tag: userProfile?.status_tag || '',
    accent_color: userProfile?.accent_color || '#3b82f6',
    social_links: {
      twitter: userProfile?.social_links?.twitter || '',
      linkedin: userProfile?.social_links?.linkedin || '',
      github: userProfile?.social_links?.github || '',
      website: userProfile?.social_links?.website || '',
      instagram: userProfile?.social_links?.instagram || '',
    }
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        status_tag: userProfile.status_tag || '',
        accent_color: userProfile.accent_color || '#3b82f6',
        social_links: {
          twitter: userProfile.social_links?.twitter || '',
          linkedin: userProfile.social_links?.linkedin || '',
          github: userProfile.social_links?.github || '',
          website: userProfile.social_links?.website || '',
          instagram: userProfile.social_links?.instagram || '',
        }
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Profile Images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('Profile Images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      await refreshUser();
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          status_tag: formData.status_tag,
          accent_color: formData.accent_color,
          social_links: formData.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      await refreshUser();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and profile settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userProfile?.profile_image_url || ''} />
            <AvatarFallback className="text-2xl">
              {userProfile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" disabled={uploading} asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </span>
              </Button>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Your username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status_tag">Status Tag</Label>
            <Input
              id="status_tag"
              value={formData.status_tag}
              onChange={(e) => handleInputChange('status_tag', e.target.value)}
              placeholder="e.g., Creator, Developer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accent_color">Accent Color</Label>
            <Input
              id="accent_color"
              type="color"
              value={formData.accent_color}
              onChange={(e) => handleInputChange('accent_color', e.target.value)}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.social_links.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.social_links.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={formData.social_links.github}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.social_links.website}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.social_links.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};
