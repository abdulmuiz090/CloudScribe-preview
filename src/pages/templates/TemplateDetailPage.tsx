
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ArrowLeft, ShoppingCart, User, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Template } from '@/types/database.types';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      if (!id) throw new Error('Template ID is required');
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          author:user_profiles!author_id(full_name, profile_image_url)
        `)
        .eq('id', id)
        .eq('published', true)
        .single();
      
      if (error) throw error;
      return data as Template & { author?: { full_name: string; profile_image_url?: string } };
    },
    enabled: !!id,
  });

  const handleDownload = () => {
    if (!template?.file_url) {
      toast({
        title: "Download Error",
        description: "Template file is not available.",
        variant: "destructive"
      });
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = template.file_url;
    link.download = `${template.name}.zip`;
    link.click();
    
    toast({
      title: "Download Started",
      description: `${template.name} is downloading...`,
    });
  };

  const handlePurchase = () => {
    toast({
      title: "Coming Soon",
      description: "Template purchasing will be available soon.",
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-video" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !template) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Template Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The template you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/templates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Template Preview */}
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              {template.preview_image_url ? (
                <img
                  src={template.preview_image_url}
                  alt={template.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground">No preview available</span>
                </div>
              )}
            </div>
          </div>

          {/* Template Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={template.is_free ? "secondary" : "default"}>
                  {template.is_free ? "Free" : `$${template.price || 0}`}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {template.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{template.author?.full_name || 'Unknown Author'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(template.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span>4.8 (23 reviews)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            </div>

            <Separator />

            {/* Usage Instructions */}
            <div>
              <h3 className="font-semibold mb-2">Usage Instructions</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Download the template file</p>
                <p>2. Extract the ZIP archive</p>
                <p>3. Follow the README instructions</p>
                <p>4. Customize to your needs</p>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              {template.is_free ? (
                <Button
                  className="w-full"
                  onClick={handleDownload}
                  disabled={!template.file_url}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handlePurchase}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy & Download - ${template.price}
                </Button>
              )}

              {/* Template Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Format:</span>
                      <span>ZIP Archive</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License:</span>
                      <span>Standard License</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Support:</span>
                      <span>6 months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
