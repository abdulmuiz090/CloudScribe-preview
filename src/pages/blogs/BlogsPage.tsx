import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { BlogCard } from "@/components/blogs/BlogCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import type { Blog } from "@/types/database.types";

interface BlogWithAuthor extends Blog {
  author?: {
    full_name: string;
    profile_image_url?: string;
  };
}

const BlogsPage = () => {
  const { userRole } = useAuth();
  const canCreate = userRole === 'admin' || userRole === 'super-admin';

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          author:user_profiles(full_name, profile_image_url)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogWithAuthor[];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Blogs</h1>
              <p className="text-muted-foreground">
                Discover insights, tutorials, and stories from our community
              </p>
            </div>
          </div>
          {canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Blog
            </Button>
          )}
        </div>

        {/* Blogs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton type="blog" count={6} />
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">No Blogs Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                No published blogs found. Check back later for new content!
              </p>
              {canCreate && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Blog
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BlogsPage;
