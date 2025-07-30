
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Mock video data for demonstration - in a real app, this would come from a database
const mockVideos = [
  {
    id: "1",
    title: "Introduction to the Platform",
    description: "A brief overview of the platform and its features",
    url: "https://example.com/videos/intro.mp4",
    thumbnail: "https://via.placeholder.com/300x150/CBD5E0/1A202C?text=Intro+Video",
    createdAt: "2025-05-08",
  },
  {
    id: "2",
    title: "Getting Started Tutorial",
    description: "Learn how to get started with the platform features",
    url: "https://example.com/videos/tutorial.mp4",
    thumbnail: "https://via.placeholder.com/300x150/CBD5E0/1A202C?text=Tutorial",
    createdAt: "2025-05-10",
  }
];

const OwnerVideosPage = () => {
  const [videos, setVideos] = useState(mockVideos);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const { toast } = useToast();

  const handleDelete = (videoId: string) => {
    // In a real app, you would make an API call to delete the video
    setVideos(videos.filter(video => video.id !== videoId));
    toast({
      title: "Video deleted",
      description: "The video has been successfully deleted.",
    });
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would handle file upload to a storage provider here
    const newVideo = {
      id: (videos.length + 1).toString(),
      title: videoTitle,
      description: videoDescription,
      url: "https://example.com/videos/new.mp4",
      thumbnail: "https://via.placeholder.com/300x150/CBD5E0/1A202C?text=New+Video",
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setVideos([...videos, newVideo]);
    setShowUploadForm(false);
    setVideoTitle("");
    setVideoDescription("");
    
    toast({
      title: "Video uploaded",
      description: "Your video has been successfully uploaded.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Videos Management</h2>
            <p className="text-muted-foreground">
              Upload and manage videos for the platform
            </p>
          </div>
          <Button onClick={() => setShowUploadForm(!showUploadForm)}>
            <Plus className="mr-2 h-4 w-4" /> Upload New Video
          </Button>
        </div>
        
        {showUploadForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Upload New Video</CardTitle>
              <CardDescription>
                Fill out the form below to upload a new video to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Video Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter video title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Video Description
                  </label>
                  <textarea
                    id="description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter video description"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="video" className="text-sm font-medium">
                    Video File
                  </label>
                  <div className="border border-dashed rounded-md p-8 text-center">
                    <input
                      id="video"
                      type="file"
                      className="hidden"
                      accept="video/*"
                    />
                    <label htmlFor="video" className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center">
                        <Plus className="h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, WEBM, MOV up to 1GB</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Upload Video</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>All Videos</CardTitle>
            <CardDescription>
              Manage all videos on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No videos available. Upload your first video!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="icon">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {video.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Uploaded on {video.createdAt}
                      </span>
                      <div className="space-x-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OwnerVideosPage;
