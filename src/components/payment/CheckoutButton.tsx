
/**
 * CheckoutButton Component
 * Purpose: Handles product checkout with 10% platform fee integration
 * Features: Paystack payment processing, automatic fee calculation
 * Platform Fee: 10% automatically deducted from seller earnings
 */
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingCart } from 'lucide-react';

// Import CartItem type from CartContext
interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

interface CheckoutButtonProps {
  // Single product checkout props
  productId?: string;
  productName?: string;
  price?: number;
  quantity?: number;
  
  // Cart checkout props
  items?: CartItem[];
  
  // Common props
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  successUrl?: string;
  cancelUrl?: string;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  productId,
  productName,
  price,
  quantity = 1,
  items,
  disabled = false,
  className = "",
  children,
  successUrl,
  cancelUrl
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Paystack public key
  const PAYSTACK_PUBLIC_KEY = 'pk_test_7093255123fa05103229f5ee62769d11e4694d5e';

  // Handle checkout process
  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a purchase.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Handle cart checkout vs single product checkout
      if (items && items.length > 0) {
        // Cart checkout - process first item for now (can be enhanced for multiple items)
        const firstItem = items[0];
        const subtotal = firstItem.price * firstItem.quantity;
        const platformFeeRate = 0.10;
        const platformFee = subtotal * platformFeeRate;

        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            product_id: firstItem.id,
            quantity: firstItem.quantity
          },
          headers: {
            'user-email': user.email || '',
            'origin': window.location.origin
          }
        });

        if (error) throw error;

        toast({
          title: "Checkout Initiated",
          description: `Total: ₦${subtotal.toFixed(2)} (includes ₦${platformFee.toFixed(2)} platform fee)`,
        });

        // Redirect to Paystack checkout
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }

      } else if (productId && price) {
        // Single product checkout
        const subtotal = price * quantity;
        const platformFeeRate = 0.10;
        const platformFee = subtotal * platformFeeRate;

        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            product_id: productId,
            quantity: quantity
          },
          headers: {
            'user-email': user.email || '',
            'origin': window.location.origin
          }
        });

        if (error) throw error;

        toast({
          title: "Checkout Initiated",
          description: `Total: ₦${subtotal.toFixed(2)} (includes ₦${platformFee.toFixed(2)} platform fee)`,
        });

        // Redirect to Paystack checkout
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate display price
  const displayPrice = items 
    ? items.reduce((total, item) => total + (item.price * item.quantity), 0)
    : (price || 0) * quantity;

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {children || (loading 
        ? 'Processing...' 
        : `Buy Now - ₦${displayPrice.toFixed(2)}`
      )}
    </Button>
  );
};
