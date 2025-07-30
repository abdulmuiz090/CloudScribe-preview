
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = currentItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + (item.quantity || 1) } 
            : i
        );
        
        toast({
          title: "Cart updated",
          description: `${item.name} quantity increased to ${existingItem.quantity + (item.quantity || 1)}`,
        });
        
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart`,
        });
        
        return [...currentItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };
  
  const removeItem = (itemId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(i => i.id === itemId);
      if (item) {
        toast({
          title: "Removed from cart",
          description: `${item.name} has been removed from your cart`,
        });
      }
      return currentItems.filter(item => item.id !== itemId);
    });
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };
  
  // Calculate total number of items and subtotal
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart,
      itemCount,
      subtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
