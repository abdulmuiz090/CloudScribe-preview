
export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxFileSize?: number; // in bytes
}

export class ImageOptimizer {
  private static readonly DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'webp',
    maxFileSize: 5 * 1024 * 1024 // 5MB
  };

  static async optimizeImage(
    file: File, 
    options: ImageUploadOptions = {}
  ): Promise<File> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Check file size
    if (file.size > opts.maxFileSize) {
      throw new Error(`File size exceeds ${opts.maxFileSize / 1024 / 1024}MB limit`);
    }
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            opts.maxWidth, 
            opts.maxHeight
          );
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'));
                return;
              }
              
              const optimizedFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, `.${opts.format}`),
                { type: `image/${opts.format}` }
              );
              
              resolve(optimizedFile);
            },
            `image/${opts.format}`,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }
}

// File upload utilities
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};
