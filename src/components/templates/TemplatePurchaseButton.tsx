import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Download, AlertCircle, Clock, Gift } from "lucide-react";
import type { Template } from "@/types/database.types";

interface TemplatePurchaseButtonProps {
  template: Template;
  onPurchaseSuccess?: () => void;
}

export const TemplatePurchaseButton = ({ template, onPurchaseSuccess }: TemplatePurchaseButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if template has active discount
  const hasActiveDiscount = template.discount_price && 
    template.discount_end_date && 
    new Date(template.discount_end_date) > new Date();

  const currentPrice = hasActiveDiscount ? template.discount_price : template.price;
  const discountPercentage = hasActiveDiscount && template.price 
    ? Math.round(((template.price - template.discount_price!) / template.price) * 100)
    : 0;

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");

      const { data, error } = await supabase.functions.invoke("create-template-purchase", {
        body: {
          template_id: template.id,
          return_url: `${window.location.origin}/templates/${template.id}/purchase-success`,
          cancel_url: `${window.location.origin}/templates/${template.id}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.is_free) {
        toast({
          title: "Free Template Downloaded",
          description: "You can now access your free template!",
        });
        onPurchaseSuccess?.();
      } else {
        // Redirect to Paystack payment
        window.open(data.payment_url, '_blank');
      }
      setPurchaseDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to initiate purchase",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase templates",
        variant: "destructive",
      });
      return;
    }

    if (template.is_free) {
      purchaseMutation.mutate();
    } else {
      setPurchaseDialog(true);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (template.is_free) {
    return (
      <Button 
        onClick={handlePurchase} 
        disabled={purchaseMutation.isPending}
        className="w-full"
      >
        {purchaseMutation.isPending ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          <>
            <Gift className="mr-2 h-4 w-4" />
            Get Free Template
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Price Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveDiscount ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(currentPrice!)}
                </span>
                <span className="text-sm line-through text-muted-foreground">
                  {formatPrice(template.price!)}
                </span>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {discountPercentage}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">
                {formatPrice(currentPrice!)}
              </span>
            )}
          </div>
        </div>

        {/* Discount Timer */}
        {hasActiveDiscount && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Clock className="h-4 w-4" />
            <span>
              Sale ends: {new Date(template.discount_end_date!).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Purchase Button */}
        <Button 
          onClick={handlePurchase} 
          disabled={purchaseMutation.isPending}
          className="w-full"
          size="lg"
        >
          {purchaseMutation.isPending ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Purchase Template
            </>
          )}
        </Button>

        {/* Payment Methods */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Secure payment via Paystack</p>
          <p className="mt-1">Card • Bank Transfer • USSD • Mobile Money</p>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialog} onOpenChange={setPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Template</DialogTitle>
            <DialogDescription>
              You're about to purchase "{template.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span>Template Price:</span>
              <span className="font-semibold">{formatPrice(currentPrice!)}</span>
            </div>
            
            {hasActiveDiscount && (
              <div className="flex items-center justify-between py-2 text-sm text-green-600">
                <span>Discount Applied:</span>
                <span>-{formatPrice(template.price! - currentPrice!)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium">What you'll get:</p>
                <ul className="mt-1 space-y-1 text-blue-700">
                  <li>• Full template files</li>
                  <li>• Up to 5 downloads</li>
                  <li>• 24-hour download access</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setPurchaseDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
                className="flex-1"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};