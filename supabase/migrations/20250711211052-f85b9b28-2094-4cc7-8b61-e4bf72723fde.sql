
-- Create announcements table for platform-wide announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  published BOOLEAN NOT NULL DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE NULL,
  created_by UUID NOT NULL REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE NULL,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super-admins can manage all announcements"
  ON public.announcements
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super-admin'
  ));

CREATE POLICY "Users can view published announcements"
  ON public.announcements
  FOR SELECT
  USING (published = true);

-- Add RLS policies for email campaigns
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super-admins can manage email campaigns"
  ON public.email_campaigns
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super-admin'
  ));

-- Add RLS policies for user activity logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super-admins can view all activity logs"
  ON public.user_activity_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super-admin'
  ));

CREATE POLICY "System can insert activity logs"
  ON public.user_activity_logs
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_announcements_published ON public.announcements(published, created_at DESC);
CREATE INDEX idx_announcements_scheduled ON public.announcements(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status, created_at DESC);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_user_activity_logs_action ON public.user_activity_logs(action, created_at DESC);

-- Create function to get platform statistics
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.user_profiles),
    'active_users', (SELECT COUNT(*) FROM public.user_profiles WHERE updated_at > now() - interval '30 days'),
    'regular_users', (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'user'),
    'admin_users', (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'admin'),
    'super_admin_users', (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'super-admin'),
    'total_content', (
      SELECT COUNT(*) FROM (
        SELECT id FROM public.blogs
        UNION ALL
        SELECT id FROM public.videos
        UNION ALL
        SELECT id FROM public.templates
        UNION ALL
        SELECT id FROM public.posts
      ) as all_content
    ),
    'published_content', (
      SELECT COUNT(*) FROM (
        SELECT id FROM public.blogs WHERE published = true
        UNION ALL
        SELECT id FROM public.videos WHERE published = true
        UNION ALL
        SELECT id FROM public.templates WHERE published = true
        UNION ALL
        SELECT id FROM public.posts WHERE published = true
      ) as published_content
    ),
    'total_products', (SELECT COUNT(*) FROM public.products),
    'published_products', (SELECT COUNT(*) FROM public.products WHERE published = true),
    'pending_admin_requests', (SELECT COUNT(*) FROM public.admin_requests WHERE status = 'pending'),
    'total_announcements', (SELECT COUNT(*) FROM public.announcements),
    'published_announcements', (SELECT COUNT(*) FROM public.announcements WHERE published = true),
    'email_campaigns', (SELECT COUNT(*) FROM public.email_campaigns),
    'recent_activity', (SELECT COUNT(*) FROM public.user_activity_logs WHERE created_at > now() - interval '24 hours')
  );
$$;

-- Create function to update admin request status and user role
CREATE OR REPLACE FUNCTION public.process_admin_request(
  request_id UUID,
  new_status TEXT,
  admin_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record admin_requests%ROWTYPE;
  result jsonb;
BEGIN
  -- Check if the caller is a super-admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = admin_id AND role = 'super-admin'
  ) THEN
    RAISE EXCEPTION 'Only super-admins can process admin requests';
  END IF;

  -- Get the request record
  SELECT * INTO request_record 
  FROM admin_requests 
  WHERE id = request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin request not found';
  END IF;

  -- Update the request status
  UPDATE admin_requests 
  SET status = new_status, updated_at = now()
  WHERE id = request_id;

  -- If approved, update user role to admin
  IF new_status = 'approved' THEN
    UPDATE user_profiles 
    SET role = 'admin', updated_at = now()
    WHERE id = request_record.user_id;
    
    -- Log the activity
    INSERT INTO user_activity_logs (user_id, action, details)
    VALUES (
      request_record.user_id, 
      'role_promoted', 
      jsonb_build_object(
        'from_role', 'user',
        'to_role', 'admin',
        'approved_by', admin_id,
        'request_id', request_id
      )
    );
  END IF;

  -- Return the updated request
  SELECT to_jsonb(admin_requests.*) INTO result
  FROM admin_requests
  WHERE id = request_id;

  RETURN result;
END;
$$;
