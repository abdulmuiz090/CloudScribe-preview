
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User, Calendar, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Blog } from '@/types/database.types';

interface BlogWithAuthor extends Blog {
  author?: {
    full_name: string;
    profile_image_url?: string;
  };
}

interface BlogCardProps {
  blog: BlogWithAuthor;
}

export function BlogCard({ blog }: BlogCardProps) {
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <Link to={`/dashboard/blogs/${blog.id}`} className="block group">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/50 hover:border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        {/* Blog Header with Author */}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={blog.author?.profile_image_url} />
              <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/10 to-primary/20">
                {blog.author?.full_name?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {blog.author?.full_name || 'Anonymous'}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getReadingTime(blog.content)} min read
                </div>
              </div>
            </div>
          </div>

          {/* Blog Title */}
          <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {blog.title}
          </h3>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {blog.published ? (
              <Badge variant="default" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                Published
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Draft
              </Badge>
            )}
            {blog.featured && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Blog Excerpt */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
            {getExcerpt(blog.content)}
          </p>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                <Heart className="h-3 w-3" />
                <span>24</span>
              </div>
              <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                <MessageCircle className="h-3 w-3" />
                <span>8</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Read more →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
