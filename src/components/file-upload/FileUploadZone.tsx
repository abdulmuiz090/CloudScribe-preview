
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  className?: string;
}

export const FileUploadZone = ({
  onFilesSelected,
  acceptedTypes = 'image/*',
  maxFiles = 1,
  className = ''
}: FileUploadZoneProps) => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { [acceptedTypes]: [] },
    maxFiles,
    multiple: maxFiles > 1
  });

  const isImage = uploadingFile?.type.startsWith('image/');

  return (
    <div className={className}>
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          {!uploading ? (
            <div
              {...getRootProps()}
              className={`cursor-pointer text-center space-y-4 ${
                isDragActive ? 'bg-muted/50' : ''
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select a file
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Max files: {maxFiles}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadingFile && (uploadingFile.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          )}

          {fileRejections.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-md">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="text-sm text-destructive">
                  <p className="font-medium">{file.name}</p>
                  {errors.map(error => (
                    <p key={error.code} className="text-xs">{error.message}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
