import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, Filter } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { EnhancedCreateTemplateDialog } from "@/components/templates/EnhancedCreateTemplateDialog";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import type { Template } from "@/types/database.types";

interface TemplateWithAuthor extends Template {
  author?: {
    full_name: string;
  };
}

const TemplatesPage = () => {
  const { userRole } = useAuth();
  const canCreate = userRole === 'admin' || userRole === 'super-admin';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['template-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['templates', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('templates')
        .select(`
          *,
          author:user_profiles(full_name),
          category:template_categories(name)
        `)
        .eq('published', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TemplateWithAuthor[];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Templates</h1>
              <p className="text-muted-foreground">
                Ready-to-use templates to jumpstart your projects
              </p>
            </div>
          </div>
          {canCreate && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton type="template" count={6} />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">No Templates Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                No published templates found. Check back later for new content!
              </p>
              {canCreate && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Template Dialog */}
      <EnhancedCreateTemplateDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setCreateDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default TemplatesPage;
