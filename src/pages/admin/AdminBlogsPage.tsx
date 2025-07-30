

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "@/lib/admin-api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminBlogsPage = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
    featured: false
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch blogs."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, formData);
        toast({
          title: "Success",
          description: "Blog updated successfully."
        });
      } else {
        await createBlog({
          ...formData,
          author_id: userProfile.id
        });
        toast({
          title: "Success",
          description: "Blog created successfully."
        });
      }
      
      setIsDialogOpen(false);
      setEditingBlog(null);
      setFormData({ title: "", content: "", published: false, featured: false });
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save blog."
      });
    }
  };

  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      published: blog.published,
      featured: blog.featured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await deleteBlog(id);
      toast({
        title: "Success",
        description: "Blog deleted successfully."
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete blog."
      });
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
            <p className="text-muted-foreground">Create and manage blog posts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingBlog(null);
                setFormData({ title: "", content: "", published: false, featured: false });
              }}>
                <Plus className="mr-2 h-4 w-4" /> Create Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
                <DialogDescription>
                  {editingBlog ? 'Update the blog post details below.' : 'Fill in the details to create a new blog post.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBlog ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Blogs</CardTitle>
                <CardDescription>{blogs.length} total blogs</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No blogs found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{blog.title}</h3>
                          <div className="flex gap-1">
                            {blog.published && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Published
                              </Badge>
                            )}
                            {blog.featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                            {!blog.published && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                Draft
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {blog.content.substring(0, 150)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By {blog.author?.full_name} • {new Date(blog.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(blog.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminBlogsPage;

