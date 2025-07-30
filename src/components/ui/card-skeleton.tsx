
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
  type?: 'product' | 'template' | 'blog';
  count?: number;
}

export function CardSkeleton({ type = 'product', count = 6 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="relative overflow-hidden bg-muted/20">
            <Skeleton className="w-full h-48" />
            <div className="absolute top-3 left-3">
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          
          <CardHeader className="pb-3">
            {type === 'blog' && (
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            )}
            
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4" />
            
            <div className="flex items-center justify-between mt-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
