-- Enhanced template schema with comprehensive features
ALTER TABLE templates ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE templates ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'personal';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS max_file_size_mb INTEGER DEFAULT 50;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS watermarked_preview_url TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS instructions_url TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS demo_url TEXT;

-- Update template categories with comprehensive list
DELETE FROM template_categories;

INSERT INTO template_categories (name, description) VALUES 
-- Productivity & Planning
('Notion Templates', 'Notion dashboards, planners, and trackers'),
('Spreadsheet Templates', 'Excel and Google Sheets templates for business and personal use'),
('Calendar Templates', 'Schedule and planning templates'),
('Productivity Tools', 'General productivity and organizational templates'),

-- Business & Marketing
('Pitch Decks', 'PowerPoint and Keynote presentation templates'),
('Business Proposals', 'Professional proposal and contract templates'),
('Social Media Templates', 'Instagram, Facebook, and social platform templates'),
('Brand Guidelines', 'Brand identity and guideline templates'),
('Invoice Templates', 'Professional invoicing and billing templates'),
('Marketing Materials', 'Flyers, brochures, and marketing templates'),

-- Design & Creative
('Canva Templates', 'Ready-to-use Canva design templates'),
('UI/UX Kits', 'Figma and Sketch interface design templates'),
('Resume Templates', 'Professional CV and resume designs'),
('eBook Templates', 'Digital book and publication layouts'),
('Print Templates', 'Printable planners, journals, and materials'),
('Adobe Templates', 'Photoshop, Illustrator, and Creative Suite templates'),

-- Tech & Development
('Web Templates', 'HTML, CSS, and JavaScript website templates'),
('Landing Pages', 'Marketing and conversion-focused page templates'),
('Email Templates', 'HTML email marketing templates'),
('App Templates', 'Mobile and web application templates'),

-- Content & Media
('Video Templates', 'Video editing and motion graphics templates'),
('Audio Templates', 'Podcast and audio production templates'),
('Photography', 'Photo editing and album templates'),

-- Specialized
('Legal Templates', 'Contracts, agreements, and legal documents'),
('Education', 'Learning and educational material templates'),
('Health & Fitness', 'Workout plans and health tracking templates'),
('Real Estate', 'Property and real estate marketing templates'),
('Non-Profit', 'Charity and organization templates');

-- Add file type validation function
CREATE OR REPLACE FUNCTION validate_template_file_type(file_type TEXT, file_size_bytes BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Allowed file types based on guidelines
  IF file_type NOT IN (
    'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv',
    'image/png', 'image/jpeg', 'image/svg+xml',
    'application/x-photoshop', 'application/postscript', 'application/x-indesign',
    'application/zip', 'text/plain', 'video/mp4', 'application/octet-stream'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Size restrictions based on file type (in bytes)
  CASE file_type
    WHEN 'video/mp4' THEN
      IF file_size_bytes > 104857600 THEN -- 100MB for videos
        RETURN FALSE;
      END IF;
    WHEN 'application/x-photoshop', 'application/postscript', 'application/x-indesign' THEN
      IF file_size_bytes > 104857600 THEN -- 100MB for design files
        RETURN FALSE;
      END IF;
    ELSE
      IF file_size_bytes > 52428800 THEN -- 50MB for other files
        RETURN FALSE;
      END IF;
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;