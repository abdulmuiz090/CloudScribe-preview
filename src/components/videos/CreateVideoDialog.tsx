
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createVideo } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Upload, Video as VideoIcon, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const videoSchema = z.object({
  title: z.string().min(1, "Video title is required"),
  description: z.string().min(1, "Description is required"),
  video_url: z.string().url("Valid video URL is required"),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  duration: z.number().min(0).optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface CreateVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateVideoDialog({ open, onOpenChange, onSuccess }: CreateVideoDialogProps) {
  const { toast } = useToast();
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      duration: 0,
      published: false,
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return createVideo({
        title: data.title,
        description: data.description,
        video_url: data.video_url,
        author_id: user.id,
        thumbnail_url: data.thumbnail_url,
        duration: data.duration,
        published: data.published,
        featured: data.featured,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Video creation error:', error);
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    const isVideo = type === 'video';
    const setter = isVideo ? setUploadingVideo : setUploadingThumbnail;
    
    setter(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = isVideo ? `videos/${fileName}` : `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      if (isVideo) {
        form.setValue('video_url', publicUrl);
      } else {
        form.setValue('thumbnail_url', publicUrl);
      }

      toast({
        title: "Success",
        description: `${isVideo ? 'Video' : 'Thumbnail'} uploaded successfully!`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${isVideo ? 'video' : 'thumbnail'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setter(false);
    }
  };

  const onSubmit = (data: VideoFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Video</DialogTitle>
          <DialogDescription>
            Upload a video file or provide a video URL
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video title" {...field} />
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
                      placeholder="Describe your video content"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">Video URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Video File</FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      id="video-file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'video');
                      }}
                    />
                    <label
                      htmlFor="video-file"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {uploadingVideo ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <p className="text-sm text-muted-foreground text-center">
                        {form.watch('video_url') 
                          ? "Video uploaded successfully! Click to replace"
                          : "Click to upload video file"
                        }
                      </p>
                    </label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Video URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a direct video URL or YouTube/Vimeo link
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <FormLabel>Thumbnail (Optional)</FormLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  id="thumbnail-file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'thumbnail');
                  }}
                />
                <label
                  htmlFor="thumbnail-file"
                  className="flex items-center justify-center cursor-pointer"
                >
                  {uploadingThumbnail ? (
                    <LoadingSpinner size="sm" />
                  ) : form.watch('thumbnail_url') ? (
                    <img 
                      src={form.watch('thumbnail_url')} 
                      alt="Thumbnail preview" 
                      className="w-24 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <VideoIcon className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Upload thumbnail</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (seconds)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Video duration in seconds"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Enter video duration for better display
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <FormDescription>
                        Make video visible to users
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Highlight this video
                      </FormDescription>
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Video'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
