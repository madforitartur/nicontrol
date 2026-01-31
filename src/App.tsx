import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrdersProvider } from "@/contexts/OrdersContext";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrdersProvider>
        <Toaster />
        <Sonner />
        <Index />
      </OrdersProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
