
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import { PublicRoutes } from "./routes/PublicRoutes";
import { UserRoutes } from "./routes/UserRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";
import { OwnerRoutes } from "./routes/OwnerRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system" storageKey="cloudscribe-ui-theme">
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/*" element={<PublicRoutes />} />
                    <Route path="/dashboard/*" element={<UserRoutes />} />
                    <Route path="/admin/*" element={<AdminRoutes />} />
                    <Route path="/owner/*" element={<OwnerRoutes />} />
                  </Routes>
                </div>
                <Toaster />
                <Sonner />
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
