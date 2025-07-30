-- Phase 1: Fix Database Structure & Categories

-- Create template categories table
CREATE TABLE IF NOT EXISTS public.template_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default template categories
INSERT INTO public.template_categories (name, description) VALUES
  ('Web Design', 'Website and web application templates'),
  ('Mobile UI', 'Mobile app interface templates'),
  ('Landing Pages', 'Marketing and landing page templates'),
  ('E-commerce', 'Online store and shopping templates'),
  ('Dashboard', 'Admin and analytics dashboard templates'),
  ('Portfolio', 'Personal and professional portfolio templates')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on template_categories
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for template categories
CREATE POLICY "Anyone can view template categories" 
ON public.template_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage template categories" 
ON public.template_categories 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add category_id to templates table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'templates' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.templates ADD COLUMN category_id UUID REFERENCES public.template_categories(id);
  END IF;
END $$;

-- Create storage buckets for posts
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('post-files', 'post-files', true),
  ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for post files
CREATE POLICY "Users can upload their own post files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'post-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view post files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-files');

CREATE POLICY "Users can update their own post files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'post-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'post-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for chat files
CREATE POLICY "Users can upload chat files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view chat files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can update their own chat files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to get content with categories
CREATE OR REPLACE FUNCTION public.get_templates_with_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_id UUID,
  category_id UUID,
  category_name TEXT,
  price NUMERIC,
  is_free BOOLEAN,
  published BOOLEAN,
  file_url TEXT,
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    t.id,
    t.name,
    t.description,
    t.author_id,
    t.category_id,
    tc.name as category_name,
    t.price,
    t.is_free,
    t.published,
    t.file_url,
    t.preview_image_url,
    t.created_at,
    t.updated_at,
    up.full_name as author_name
  FROM public.templates t
  LEFT JOIN public.template_categories tc ON t.category_id = tc.id
  LEFT JOIN public.user_profiles up ON t.author_id = up.id
  WHERE t.published = true
  ORDER BY t.created_at DESC;
$$;

-- Create function to get products with categories
CREATE OR REPLACE FUNCTION public.get_products_with_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  seller_id UUID,
  category_id UUID,
  category_name TEXT,
  price NUMERIC,
  stock INTEGER,
  published BOOLEAN,
  featured BOOLEAN,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  seller_name TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.seller_id,
    p.category_id,
    pc.name as category_name,
    p.price,
    p.stock,
    p.published,
    p.featured,
    p.image_url,
    p.created_at,
    p.updated_at,
    up.full_name as seller_name
  FROM public.products p
  LEFT JOIN public.product_categories pc ON p.category_id = pc.id
  LEFT JOIN public.user_profiles up ON p.seller_id = up.id
  WHERE p.published = true
  ORDER BY p.created_at DESC;
$$;

-- Enable realtime for chat functionality
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;