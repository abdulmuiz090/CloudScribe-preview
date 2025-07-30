
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

const CheckoutSuccessPage = () => {
  const { clearCart } = useCart();
  
  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
  }, [clearCart]);
  
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-lg mb-8">
          Your order has been successfully processed. We've sent a confirmation email with your order details.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h2 className="font-medium mb-2">What's Next?</h2>
            <p className="text-muted-foreground">
              You'll receive an email when your items are ready for download or when physical items have been shipped.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/marketplace">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutSuccessPage;
