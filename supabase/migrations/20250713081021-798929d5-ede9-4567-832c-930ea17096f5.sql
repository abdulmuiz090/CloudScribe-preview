-- Create wallets for all existing users who don't have one
INSERT INTO user_wallets (user_id, available_balance, pending_balance, total_earnings)
SELECT 
  id,
  0.00,
  0.00,
  0.00
FROM user_profiles 
WHERE id NOT IN (SELECT user_id FROM user_wallets WHERE user_id IS NOT NULL);

-- Update the create_user_wallet function to handle edge cases
CREATE OR REPLACE FUNCTION public.create_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only insert if wallet doesn't already exist
  INSERT INTO public.user_wallets (user_id, available_balance, pending_balance, total_earnings)
  VALUES (NEW.id, 0.00, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;