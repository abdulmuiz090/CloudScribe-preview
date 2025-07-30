import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadWithProgressProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileUpload: (url: string, fileInfo: { size: number; type: string; name: string }) => void;
  bucketName: string;
  folder?: string;
  currentFile?: string;
  enforceZipForLargeFiles?: boolean;
  largeFileThreshold?: number; // in MB
  title: string;
  description?: string;
  className?: string;
}

export function FileUploadWithProgress({
  accept = "*/*",
  maxSize = 50,
  onFileUpload,
  bucketName,
  folder = "",
  currentFile,
  enforceZipForLargeFiles = false,
  largeFileThreshold = 25,
  title,
  description,
  className = ""
}: FileUploadWithProgressProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Size validation
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return `File size must be less than ${maxSize}MB`;
    }

    // ZIP enforcement for large files
    if (enforceZipForLargeFiles && fileSizeInMB > largeFileThreshold) {
      const isZipFile = file.type === 'application/zip' || 
                       file.type === 'application/x-zip-compressed' ||
                       file.name.toLowerCase().endsWith('.zip');
      if (!isZipFile) {
        return `Files larger than ${largeFileThreshold}MB must be in ZIP format`;
      }
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "File validation failed",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setProgress(100);
      setUploadedFile(file.name);
      
      onFileUpload(publicUrl, {
        size: file.size,
        type: file.type,
        name: file.name
      });

      toast({
        title: "Success",
        description: `${title} uploaded successfully!`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${title.toLowerCase()}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : uploadedFile 
            ? 'border-green-500 bg-green-50' 
            : 'border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
        />
        
        <label
          htmlFor={`file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="flex flex-col items-center cursor-pointer"
        >
          {uploading ? (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="w-full">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Uploading... {progress}%
                </p>
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">
                  {uploadedFile}
                </p>
                <p className="text-xs text-green-600">
                  Upload successful
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  removeFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {dragOver ? `Drop ${title.toLowerCase()} here` : `Click to upload ${title.toLowerCase()}`}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground/70 mt-1 text-center">
                  {description}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Max: {maxSize}MB
                </Badge>
                {enforceZipForLargeFiles && (
                  <Badge variant="outline" className="text-xs">
                    ZIP required &gt;{largeFileThreshold}MB
                  </Badge>
                )}
              </div>
            </>
          )}
        </label>
      </div>
    </div>
  );
}