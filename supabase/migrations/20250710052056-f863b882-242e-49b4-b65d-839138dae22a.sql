
-- Create chat_message_reactions table for message reactions
CREATE TABLE public.chat_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for chat_message_reactions
ALTER TABLE public.chat_message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view message reactions" 
  ON public.chat_message_reactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can add their own reactions" 
  ON public.chat_message_reactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
  ON public.chat_message_reactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create security_logs table for security event logging
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super-admins can view security logs" 
  ON public.security_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super-admin'::user_role
  ));

CREATE POLICY "System can insert security logs" 
  ON public.security_logs 
  FOR INSERT 
  WITH CHECK (true);
