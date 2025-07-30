
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Template } from '@/types/database.types';

interface TemplateWithAuthor extends Template {
  author?: {
    full_name: string;
  };
}

interface TemplateCardProps {
  template: TemplateWithAuthor;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Link to={`/dashboard/templates/${template.id}`} className="block group">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/50 hover:border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        {/* Template Preview */}
        <div className="relative overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
          {template.preview_image_url ? (
            <img
              src={template.preview_image_url}
              alt={template.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-accent/10 to-accent/20 flex items-center justify-center">
              <Eye className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            {template.is_free ? (
              <Badge variant="default" className="text-xs font-medium bg-green-500/90 backdrop-blur-sm text-white">
                Free
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-medium bg-background/90 backdrop-blur-sm">
                Premium
              </Badge>
            )}
            {!template.published && (
              <Badge variant="secondary" className="text-xs font-medium bg-secondary/90 backdrop-blur-sm">
                Draft
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
                <span className="text-xs">(12)</span>
              </div>
              
              <div className="text-right">
                {template.is_free ? (
                  <div className="font-bold text-lg text-green-600">
                    Free
                  </div>
                ) : (
                  <div className="font-bold text-lg text-primary">
                    {formatPrice(Number(template.price || 0))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
            {template.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              by {template.author?.full_name || 'Anonymous'}
            </div>
            
            <Button 
              size="sm" 
              variant={template.is_free ? "outline" : "default"}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {template.is_free ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              ) : (
                <>
                  View Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
