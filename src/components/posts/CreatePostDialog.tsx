import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Upload, Link, FileText, Image, Video, Loader2 } from 'lucide-react';
import { FileUploadZone } from '@/components/file-upload/FileUploadZone';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  contentType: z.enum(['text', 'image', 'video', 'file', 'link']),
  textContent: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  fileUrl: z.string().optional(),
  linkUrl: z.string().url('Please enter a valid URL').optional(),
  linkTitle: z.string().optional(),
  linkDescription: z.string().optional(),
  isPaid: z.boolean().default(false),
  price: z.number().min(0, 'Price must be positive').optional(),
  visibility: z.enum(['public', 'followers', 'paid']).default('public'),
});

type PostFormData = z.infer<typeof postSchema>;

interface CreatePostDialogProps {
  onPostCreated?: () => void;
}

export const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      contentType: 'text',
      textContent: '',
      isPaid: false,
      price: 0,
      visibility: 'public',
    },
  });

  const contentType = form.watch('contentType');
  const isPaid = form.watch('isPaid');

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return null;
    
    const file = files[0];
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('post-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const onSubmit = async (data: PostFormData) => {
    if (!userProfile?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a post.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let contentData: Record<string, any> = {};

      // Handle different content types
      switch (data.contentType) {
        case 'text':
          contentData = { text: data.textContent || '' };
          break;
        case 'image':
          if (uploadedFiles.length > 0) {
            const imageUrl = await handleFileUpload(uploadedFiles);
            if (imageUrl) {
              contentData = { image_url: imageUrl };
            }
          } else if (data.imageUrl) {
            contentData = { image_url: data.imageUrl };
          }
          break;
        case 'video':
          if (uploadedFiles.length > 0) {
            const videoUrl = await handleFileUpload(uploadedFiles);
            if (videoUrl) {
              contentData = { video_url: videoUrl };
            }
          } else if (data.videoUrl) {
            contentData = { video_url: data.videoUrl };
          }
          break;
        case 'file':
          if (uploadedFiles.length > 0) {
            const fileUrl = await handleFileUpload(uploadedFiles);
            if (fileUrl) {
              contentData = { file_url: fileUrl };
            }
          } else if (data.fileUrl) {
            contentData = { file_url: data.fileUrl };
          }
          break;
        case 'link':
          contentData = {
            link_url: data.linkUrl || '',
            link_title: data.linkTitle || '',
            link_description: data.linkDescription || '',
          };
          break;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          admin_id: userProfile.id,
          title: data.title,
          content_type: data.contentType,
          content_data: contentData,
          is_paid: data.isPaid,
          price: data.isPaid ? data.price : 0,
          visibility: data.visibility,
          published: true,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your post has been created successfully!',
      });

      form.reset();
      setUploadedFiles([]);
      setOpen(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentFields = () => {
    switch (contentType) {
      case 'text':
        return (
          <FormField
            control={form.control}
            name="textContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your post content..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <FormLabel>Upload Image</FormLabel>
              <FileUploadZone
                onFilesSelected={setUploadedFiles}
                acceptedTypes="image/*"
                maxFiles={1}
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">or</div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <FormLabel>Upload Video</FormLabel>
              <FileUploadZone
                onFilesSelected={setUploadedFiles}
                acceptedTypes="video/*"
                maxFiles={1}
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">or</div>
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/video.mp4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <div>
              <FormLabel>Upload File</FormLabel>
              <FileUploadZone
                onFilesSelected={setUploadedFiles}
                acceptedTypes="*/*"
                maxFiles={1}
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">or</div>
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/document.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="linkTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Article title or name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="linkDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the link..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'file': return <Upload className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(field.value)}
                            <span className="capitalize">{field.value}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Text
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="file">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          File
                        </div>
                      </SelectItem>
                      <SelectItem value="link">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          Link
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderContentFields()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="followers">Followers Only</SelectItem>
                        <SelectItem value="paid">Paid Content</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Paid Content</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Charge users to view this post
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

                {isPaid && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
