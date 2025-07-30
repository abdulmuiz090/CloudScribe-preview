
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getFeedback, updateFeedbackStatus } from "@/lib/admin-api";
import { Check, X, MessageSquare } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Feedback } from "@/types/database.types";

const AdminFeedbackPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: getFeedback,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateFeedbackStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast({
        title: "Success",
        description: "Feedback status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feedback status.",
        variant: "destructive",
      });
    },
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
          message="Failed to load feedback. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin-feedback'] })}
        />
      </DashboardLayout>
    );
  }

  const pendingFeedback = feedback?.filter((item: Feedback) => item.status === 'pending') || [];
  const resolvedFeedback = feedback?.filter((item: Feedback) => item.status !== 'pending') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Feedback Management</h2>
            <p className="text-muted-foreground">
              Review and respond to user feedback
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              {pendingFeedback.length} Pending
            </Badge>
            <Badge variant="secondary">
              {resolvedFeedback.length} Resolved
            </Badge>
          </div>
        </div>

        {pendingFeedback.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pending Feedback</h3>
            {pendingFeedback.map((item: Feedback) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(item as any).user?.profile_image_url} />
                        <AvatarFallback>
                          {(item as any).user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {(item as any).user?.full_name || 'Anonymous User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                      <Badge variant="secondary">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.content}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({
                        id: item.id,
                        status: 'resolved'
                      })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Resolved
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({
                        id: item.id,
                        status: 'dismissed'
                      })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {resolvedFeedback.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resolved Feedback</h3>
            {resolvedFeedback.map((item: Feedback) => (
              <Card key={item.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(item as any).user?.profile_image_url} />
                        <AvatarFallback>
                          {(item as any).user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {(item as any).user?.full_name || 'Anonymous User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                      <Badge variant={item.status === 'resolved' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {feedback?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
                <p className="text-muted-foreground">
                  User feedback will appear here when submitted
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminFeedbackPage;
