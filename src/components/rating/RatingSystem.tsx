
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAverageRating, getUserRating, upsertRating } from '@/lib/ratings-api';

interface RatingSystemProps {
  contentId: string;
  contentType: 'post' | 'product' | 'blog' | 'template';
  onRatingSubmitted?: () => void;
}

export const RatingSystem = ({ contentId, contentType, onRatingSubmitted }: RatingSystemProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: averageRating } = useQuery({
    queryKey: ['average-rating', contentId, contentType],
    queryFn: () => getAverageRating(contentId, contentType),
  });

  const { data: userRating } = useQuery({
    queryKey: ['user-rating', contentId, contentType],
    queryFn: () => getUserRating(contentId, contentType),
    enabled: !!user,
  });

  useEffect(() => {
    if (userRating) {
      setRating(userRating.rating);
      setComment(userRating.comment || '');
    }
  }, [userRating]);

  const submitMutation = useMutation({
    mutationFn: () => upsertRating(contentId, contentType, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['average-rating', contentId, contentType] });
      queryClient.invalidateQueries({ queryKey: ['user-rating', contentId, contentType] });
      
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });
      
      onRatingSubmitted?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate this content.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rate this {contentType}</CardTitle>
        {averageRating && averageRating.count > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    averageRating.average >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span>{averageRating.average} out of 5 ({averageRating.count} ratings)</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              className="p-1"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  (hoverRating >= star || rating >= star)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            </Button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Optional Comment */}
        <div>
          <Textarea
            placeholder="Add a comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitRating}
          disabled={submitMutation.isPending || rating === 0}
          className="w-full"
        >
          {submitMutation.isPending ? "Submitting..." : userRating ? "Update Rating" : "Submit Rating"}
        </Button>
      </CardContent>
    </Card>
  );
};
