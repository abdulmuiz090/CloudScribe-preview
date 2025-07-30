import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Download, AlertCircle, CheckCircle } from "lucide-react";

interface TemplateDownloadButtonProps {
  purchaseId: string;
  templateName: string;
  downloadToken?: string;
  remainingDownloads?: number;
  maxDownloads?: number;
  onDownloadSuccess?: () => void;
}

export const TemplateDownloadButton = ({ 
  purchaseId, 
  templateName, 
  downloadToken,
  remainingDownloads = 5,
  maxDownloads = 5,
  onDownloadSuccess 
}: TemplateDownloadButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloadDialog, setDownloadDialog] = useState(false);

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");

      const { data, error } = await supabase.functions.invoke("download-template", {
        body: {
          purchase_id: purchaseId,
          download_token: downloadToken,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Trigger file download
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = `${templateName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `${templateName} is now downloading. ${data.remaining_downloads} downloads remaining.`,
      });

      onDownloadSuccess?.();
      setDownloadDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to generate download link",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to download templates",
        variant: "destructive",
      });
      return;
    }

    if (remainingDownloads <= 0) {
      toast({
        title: "Download Limit Reached",
        description: "You have reached the maximum number of downloads for this template",
        variant: "destructive",
      });
      return;
    }

    setDownloadDialog(true);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Template Purchased
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {remainingDownloads}/{maxDownloads} downloads
          </Badge>
        </div>

        <Button 
          onClick={handleDownload} 
          disabled={downloadMutation.isPending || remainingDownloads <= 0}
          className="w-full"
          size="lg"
        >
          {downloadMutation.isPending ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Preparing Download...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </>
          )}
        </Button>

        {remainingDownloads <= 2 && remainingDownloads > 0 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-orange-700">
              Warning: Only {remainingDownloads} download{remainingDownloads !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}
      </div>

      {/* Download Confirmation Dialog */}
      <Dialog open={downloadDialog} onOpenChange={setDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Template</DialogTitle>
            <DialogDescription>
              You're about to download "{templateName}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span>Template:</span>
              <span className="font-semibold">{templateName}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span>Downloads remaining:</span>
              <Badge variant="outline">
                {remainingDownloads}/{maxDownloads}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium">Download Information:</p>
                <ul className="mt-1 space-y-1 text-blue-700">
                  <li>• Download link expires in 2 hours</li>
                  <li>• Files are delivered as a ZIP archive</li>
                  <li>• This will count as 1 download</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDownloadDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => downloadMutation.mutate()}
                disabled={downloadMutation.isPending}
                className="flex-1"
              >
                {downloadMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  'Start Download'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};