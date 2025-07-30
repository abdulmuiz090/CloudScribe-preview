
-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'payout', 'sale', 'fee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT NOT NULL,
  reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user wallets table
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  available_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  pending_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  bank_details JSONB DEFAULT '{}'::jsonb,
  paystack_recipient_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'direct')),
  created_by UUID REFERENCES auth.users NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat room members table
CREATE TABLE public.chat_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- Wallet RLS policies
CREATE POLICY "Users can view their own wallet" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.user_wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

-- Chat RLS policies
CREATE POLICY "Users can view public chat rooms" ON public.chat_rooms
  FOR SELECT USING (type = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON public.chat_rooms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view messages in joined rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = chat_messages.room_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to joined rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = chat_messages.room_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view room memberships" ON public.chat_room_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON public.chat_room_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'credit' OR NEW.type = 'sale' THEN
      UPDATE public.user_wallets 
      SET 
        available_balance = available_balance + NEW.amount,
        total_earnings = total_earnings + NEW.amount,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'debit' OR NEW.type = 'payout' OR NEW.type = 'fee' THEN
      UPDATE public.user_wallets 
      SET 
        available_balance = available_balance - NEW.amount,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for wallet balance updates
CREATE TRIGGER update_wallet_balance_trigger
  AFTER INSERT OR UPDATE ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Create function to create wallet on user creation
CREATE OR REPLACE FUNCTION public.create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create wallet for new users
CREATE TRIGGER create_wallet_on_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_wallet();

-- Enable realtime for chat
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_members REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;

-- Insert default chat rooms
INSERT INTO public.chat_rooms (name, description, type, created_by) VALUES
('General Discussion', 'Main community chat room', 'public', (SELECT id FROM auth.users LIMIT 1)),
('Developers', 'Chat for developers and tech discussions', 'public', (SELECT id FROM auth.users LIMIT 1)),
('Designers', 'Chat for designers and creative discussions', 'public', (SELECT id FROM auth.users LIMIT 1));
