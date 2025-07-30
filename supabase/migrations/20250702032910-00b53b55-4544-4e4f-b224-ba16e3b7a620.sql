
-- Add category_id column to templates table first
ALTER TABLE public.templates 
ADD COLUMN category_id UUID REFERENCES public.template_categories(id);

-- Create template categories table
CREATE TABLE public.template_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default template categories
INSERT INTO public.template_categories (name, description) VALUES
  ('Web Templates', 'Website and web application templates'),
  ('Mobile Templates', 'Mobile app templates and designs'),
  ('Graphics', 'Graphic design templates and resources'),
  ('Documents', 'Document templates and forms'),
  ('Presentations', 'Presentation and slide templates');

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
  ('products', 'products', true),
  ('templates', 'templates', true),
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true);

-- Create storage policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
