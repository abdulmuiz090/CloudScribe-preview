
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash, ShoppingCart, ArrowRight, Plus, Minus } from "lucide-react";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const isMobile = useIsMobile();

  if (items.length === 0) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h2>
            
            <Card className="border-dashed">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-muted rounded-full p-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Your cart is empty</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Looks like you haven't added any items to your cart yet. Browse our marketplace to find something you like.
                    </p>
                  </div>
                  <Button asChild className="mt-4">
                    <Link to="/marketplace">Browse Marketplace</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCart}
              className="w-full sm:w-auto"
            >
              Clear Cart
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Desktop Header */}
              {!isMobile && (
                <div className="bg-muted rounded-md p-3 hidden lg:grid grid-cols-12 text-sm font-medium">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
              )}
              
              {/* Cart Items */}
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Product Info */}
                    <div className="lg:col-span-6 flex gap-4 items-center">
                      <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="lg:col-span-2 flex justify-between lg:justify-center items-center">
                      <span className="lg:hidden text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="lg:col-span-2 flex justify-between lg:justify-center items-center">
                      <span className="lg:hidden text-sm text-muted-foreground">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Total & Actions */}
                    <div className="lg:col-span-2 flex justify-between lg:justify-end items-center">
                      <span className="lg:hidden text-sm text-muted-foreground">Total:</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Cart Summary - Mobile/Desktop Responsive */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>Calculated at checkout</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <CheckoutButton 
                        items={items} 
                        className="w-full"
                        successUrl="/checkout/success"
                        cancelUrl="/checkout/cancel"
                      >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </CheckoutButton>
                      
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/marketplace">Continue Shopping</Link>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      <p>Secure checkout powered by Stripe</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </DashboardLayout>
  );
};

export default CartPage;
