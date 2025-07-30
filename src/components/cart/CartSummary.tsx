
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckoutButton } from '@/components/payment/CheckoutButton';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartSummary = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (itemCount === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add some items to get started
              </p>
            </div>
            <Button asChild>
              <Link to="/marketplace">Browse Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Cart Summary</span>
          <span className="text-sm font-normal text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                <p className="text-xs text-muted-foreground">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90 ml-2"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <CheckoutButton 
            items={items}
            className="w-full"
            successUrl="/checkout/success"
            cancelUrl="/checkout/cancel"
          >
            Proceed to Checkout
          </CheckoutButton>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/cart">View Full Cart</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
