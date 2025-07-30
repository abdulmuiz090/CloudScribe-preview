-- Phase 1: Database Schema Enhancement for Templates

-- Add missing fields to templates table
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS discount_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_end_date timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS post_purchase_questions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cta_buttons jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN',
ADD COLUMN IF NOT EXISTS supports_international boolean DEFAULT false;

-- Create template purchases table
CREATE TABLE IF NOT EXISTS public.template_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  purchase_price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  payment_reference text,
  payment_status text NOT NULL DEFAULT 'pending',
  download_count integer DEFAULT 0,
  max_downloads integer DEFAULT 5,
  purchase_date timestamp with time zone DEFAULT now(),
  last_download_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create template reviews table
CREATE TABLE IF NOT EXISTS public.template_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  purchase_id uuid NOT NULL REFERENCES public.template_purchases(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_verified_purchase boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(purchase_id) -- One review per purchase
);

-- Create post purchase feedback table
CREATE TABLE IF NOT EXISTS public.template_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  purchase_id uuid NOT NULL REFERENCES public.template_purchases(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  questions_and_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  seller_response text DEFAULT NULL,
  seller_responded_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create secure download tokens table
CREATE TABLE IF NOT EXISTS public.template_download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES public.template_purchases(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  used_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_download_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_purchases
CREATE POLICY "Users can view their purchases and sales" ON public.template_purchases
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can insert purchases" ON public.template_purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Buyers can update their purchase records" ON public.template_purchases
  FOR UPDATE USING (auth.uid() = buyer_id);

-- RLS Policies for template_reviews
CREATE POLICY "Anyone can view reviews" ON public.template_reviews
  FOR SELECT USING (true);

CREATE POLICY "Verified buyers can create reviews" ON public.template_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND 
    EXISTS (
      SELECT 1 FROM public.template_purchases 
      WHERE id = purchase_id AND buyer_id = auth.uid() AND payment_status = 'completed'
    )
  );

CREATE POLICY "Reviewers can update their own reviews" ON public.template_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- RLS Policies for template_feedback
CREATE POLICY "Buyers and sellers can view feedback" ON public.template_feedback
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can insert feedback" ON public.template_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can update feedback responses" ON public.template_feedback
  FOR UPDATE USING (auth.uid() = seller_id);

-- RLS Policies for template_download_tokens
CREATE POLICY "Users can view their own download tokens" ON public.template_download_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.template_purchases 
      WHERE id = purchase_id AND buyer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage download tokens" ON public.template_download_tokens
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_purchases_buyer_id ON public.template_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_seller_id ON public.template_purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON public.template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_template_id ON public.template_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_template_feedback_seller_id ON public.template_feedback(seller_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON public.template_download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON public.template_download_tokens(expires_at);

-- Function to clean up expired download tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_download_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.template_download_tokens 
  WHERE expires_at < now() AND used = false;
$$;

-- Function to generate secure download token
CREATE OR REPLACE FUNCTION public.generate_download_token(purchase_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_string text;
  token_exists boolean;
BEGIN
  -- Check if purchase exists and is completed
  IF NOT EXISTS (
    SELECT 1 FROM public.template_purchases 
    WHERE id = purchase_uuid AND payment_status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Invalid or incomplete purchase';
  END IF;
  
  -- Generate unique token
  LOOP
    token_string := encode(gen_random_bytes(32), 'hex');
    SELECT EXISTS(SELECT 1 FROM public.template_download_tokens WHERE token = token_string) INTO token_exists;
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  -- Insert token with 24-hour expiry
  INSERT INTO public.template_download_tokens (purchase_id, token, expires_at)
  VALUES (purchase_uuid, token_string, now() + interval '24 hours');
  
  RETURN token_string;
END;
$$;