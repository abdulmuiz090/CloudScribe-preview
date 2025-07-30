

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Plus, 
  Search, 
  Edit,
  Eye,
  Trash2,
  ChevronDown,
  Loader2
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  author?: {
    full_name: string;
  };
}

const OwnerBlogsPage = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          author:user_profiles!author_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredPosts = blogs.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.author?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedPosts = filteredPosts.filter(post => post.published);
  const draftPosts = filteredPosts.filter(post => !post.published);
  const featuredPosts = filteredPosts.filter(post => post.featured);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const BlogTable = ({ posts, caption }: { posts: Blog[], caption: string }) => (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">
              {post.title}
              {post.featured && (
                <Badge variant="secondary" className="ml-2">Featured</Badge>
              )}
            </TableCell>
            <TableCell>{post.author?.full_name || 'Unknown'}</TableCell>
            <TableCell>
              {post.published ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Draft</Badge>
              )}
            </TableCell>
            <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {posts.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              No blog posts found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
            <p className="text-muted-foreground">
              Create, edit, and manage blog posts
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Blog Post
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
            <CardDescription>
              Manage all blog content across your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="all">All Posts ({blogs.length})</TabsTrigger>
                  <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
                  <TabsTrigger value="draft">Drafts ({draftPosts.length})</TabsTrigger>
                  <TabsTrigger value="featured">Featured ({featuredPosts.length})</TabsTrigger>
                </TabsList>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blog posts..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <TabsContent value="all">
                <BlogTable posts={filteredPosts} caption="A list of all blog posts." />
              </TabsContent>
              
              <TabsContent value="published">
                <BlogTable posts={publishedPosts} caption="Published blog posts." />
              </TabsContent>
              
              <TabsContent value="draft">
                <BlogTable posts={draftPosts} caption="Draft blog posts." />
              </TabsContent>
              
              <TabsContent value="featured">
                <BlogTable posts={featuredPosts} caption="Featured blog posts." />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OwnerBlogsPage;

