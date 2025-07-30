
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | unknown, 
    options: ErrorOptions = {}
  ) => {
    const {
      title = "Something went wrong",
      showToast = true,
      logError = true
    } = options;

    // Log error to console
    if (logError) {
      console.error('Error caught by error handler:', error);
    }

    // Show toast notification
    if (showToast) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';

      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    }

    // Return error details for further handling if needed
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
      originalError: error
    };
  }, [toast]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
}
