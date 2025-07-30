
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const urlSchema = z.string().url('Invalid URL format');

// Content validation schemas
export const postContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  visibility: z.enum(['public', 'private']).default('public'),
  is_paid: z.boolean().default(false),
  price: z.number().min(0).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  content_id: uuidSchema,
  content_type: z.enum(['post', 'blog', 'video', 'product']),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').optional(),
  status_tag: z.string().max(50, 'Status tag too long').optional(),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  action: z.string(),
  userId: uuidSchema,
  timestamp: z.number(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

export function validateFileUpload(file: File, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']): boolean {
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed`);
  }
  
  return true;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateAndSanitizeInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}
