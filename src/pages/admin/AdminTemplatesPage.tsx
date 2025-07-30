
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMyTemplates, updateTemplate, deleteTemplate, getTemplateCategories } from "@/lib/admin-api";
import { Plus, Edit, Trash2, Eye, EyeOff, Download, Filter } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import { EditTemplateDialog } from "@/components/templates/EditTemplateDialog";
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
import type { Template } from "@/types/database.types";

const AdminTemplatesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['my-templates'],
    queryFn: getMyTemplates,
  });

  const { data: categories } = useQuery({
    queryKey: ['template-categories'],
    queryFn: getTemplateCategories,
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateTemplate(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-templates'] });
      toast({
        title: "Success",
        description: "Template status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    },
  });

  // Filter templates
  const filteredTemplates = templates?.filter((template: Template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && template.published) ||
                         (statusFilter === "draft" && !template.published);
    
    const matchesPrice = priceFilter === "all" ||
                        (priceFilter === "free" && template.is_free) ||
                        (priceFilter === "paid" && !template.is_free);
    
    return matchesSearch && matchesStatus && matchesPrice;
  });

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
          message="Failed to load templates. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['my-templates'] })}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Templates</h2>
            <p className="text-muted-foreground">
              Manage your template library and publishing status
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
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
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates?.map((template: Template) => (
            <Card key={template.id}>
              <CardHeader className="pb-2">
                {template.preview_image_url && (
                  <div className="aspect-video rounded-md bg-muted mb-2 overflow-hidden">
                    <img 
                      src={template.preview_image_url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={template.published ? "default" : "secondary"}>
                      {template.published ? "Published" : "Draft"}
                    </Badge>
                    {template.is_free ? (
                      <Badge variant="outline">Free</Badge>
                    ) : (
                      <Badge variant="secondary">${template.price}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => publishMutation.mutate({
                      id: template.id,
                      published: !template.published
                    })}
                    disabled={publishMutation.isPending}
                  >
                    {template.published ? (
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
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {template.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={template.file_url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{template.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(template.id)}
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

        {filteredTemplates?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  {templates?.length === 0 
                    ? "Get started by creating your first template"
                    : "Try adjusting your filters to see more results"
                  }
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <CreateTemplateDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-templates'] });
            setCreateDialogOpen(false);
          }}
        />

        {editingTemplate && (
          <EditTemplateDialog
            template={editingTemplate}
            open={!!editingTemplate}
            onOpenChange={(open) => !open && setEditingTemplate(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['my-templates'] });
              setEditingTemplate(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTemplatesPage;
