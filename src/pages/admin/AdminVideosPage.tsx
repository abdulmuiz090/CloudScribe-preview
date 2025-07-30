
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMyVideos, updateVideo, deleteVideo } from "@/lib/admin-api";
import { Plus, Edit, Trash2, Eye, EyeOff, Play, Filter } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateVideoDialog } from "@/components/videos/CreateVideoDialog";
import { EditVideoDialog } from "@/components/videos/EditVideoDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Video } from "@/types/database.types";

const AdminVideosPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['my-videos'],
    queryFn: getMyVideos,
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateVideo(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-videos'] });
      toast({
        title: "Success",
        description: "Video status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-videos'] });
      toast({
        title: "Success",
        description: "Video deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video.",
        variant: "destructive",
      });
    },
  });

  // Filter videos
  const filteredVideos = videos?.filter((video: Video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && video.published) ||
                         (statusFilter === "draft" && !video.published) ||
                         (statusFilter === "featured" && video.featured);
    
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage 
          message="Failed to load videos. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['my-videos'] })}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Videos</h2>
            <p className="text-muted-foreground">
              Manage your video content and publishing status
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4 flex-1">
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredVideos?.map((video: Video) => (
            <Card key={video.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-start space-x-4">
                  {/* Video Thumbnail */}
                  <div className="relative w-32 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {video.description}
                    </CardDescription>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Created: {new Date(video.created_at).toLocaleDateString()}</span>
                      {video.updated_at !== video.created_at && (
                        <span>• Updated: {new Date(video.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={video.published ? "default" : "secondary"}>
                    {video.published ? "Published" : "Draft"}
                  </Badge>
                  {video.featured && (
                    <Badge variant="outline">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Duration: {formatDuration(video.duration)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => publishMutation.mutate({
                        id: video.id,
                        published: !video.published
                      })}
                      disabled={publishMutation.isPending}
                    >
                      {video.published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingVideo(video)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Video</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{video.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(video.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVideos?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground mb-4">
                  {videos?.length === 0 
                    ? "Get started by uploading your first video"
                    : "Try adjusting your filters to see more results"
                  }
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <CreateVideoDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-videos'] });
            setCreateDialogOpen(false);
          }}
        />

        {editingVideo && (
          <EditVideoDialog
            video={editingVideo}
            open={!!editingVideo}
            onOpenChange={(open) => !open && setEditingVideo(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['my-videos'] });
              setEditingVideo(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminVideosPage;
