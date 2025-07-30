
import { ShoppingCart, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCart } from "@/contexts/CartContext";
import type { CartItem } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { Link } from "react-router-dom";

export function CartDropdown() {
  const { items, removeItem, itemCount, subtotal } = useCart();
  
  if (itemCount === 0) {
    return (
      <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
          <ShoppingCart className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {itemCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="font-medium">Shopping Cart</h3>
          <Badge variant="secondary">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Badge>
        </div>
        
        {items.length > 0 ? (
          <>
            <ScrollArea className="max-h-80">
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} onRemove={() => removeItem(item.id)} />
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <CheckoutButton 
                  items={items} 
                  className="w-full"
                  successUrl="/checkout/success"
                  cancelUrl="/checkout/cancel"
                >
                  Checkout
                </CheckoutButton>
                
                <Button variant="outline" size="sm" asChild>
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Your cart is empty.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function CartItemComponent({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3">
      {item.image_url ? (
        <div className="h-12 w-12 bg-muted rounded-md overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>${item.price.toFixed(2)}</span>
          <X className="h-3 w-3 mx-1" />
          <span>{item.quantity}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 text-muted-foreground hover:text-destructive" 
        onClick={onRemove}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
