
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CheckoutCancelPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto py-12">
        <Alert className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Checkout Cancelled</AlertTitle>
          <AlertDescription>
            Your checkout process was cancelled. Your cart items are still saved.
          </AlertDescription>
        </Alert>
        
        <div className="p-6 border rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Need help with your purchase?</h1>
          <p className="text-muted-foreground mb-6">
            If you encountered any issues during checkout, or if you have questions about our products, we're here to help.
          </p>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium">Common checkout issues:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Payment method declined</li>
                <li>Connection issues during checkout</li>
                <li>Questions about shipping or delivery</li>
                <li>Product availability concerns</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild>
                <Link to="/cart">Return to Cart</Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/settings">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutCancelPage;
