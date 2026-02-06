import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MerchantLanding from "./pages/MerchantLanding";
import MerchantUniqueScan from "./pages/MerchantUniqueScan";
import MerchantScan from "./pages/MerchantScan";
import MerchantForm from "./pages/MerchantForm";
import CustomerEntry from "./pages/CustomerEntry";
import CustomerTracking from "./pages/CustomerTracking";
import DeliveryScan from "./pages/DeliveryScan";
import DeliveryScanner from "./pages/DeliveryScanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer routes */}
          <Route path="/order" element={<CustomerEntry />} />
          <Route path="/order/:orderId" element={<CustomerTracking />} />

          {/* Merchant routes */}
          <Route path="/order/merchant" element={<MerchantLanding />} />
          <Route path="/order/merchant/common" element={<MerchantScan />} />
          <Route path="/order/merchant/unique" element={<MerchantUniqueScan />} />
          <Route path="/order/merchant/update/:orderId" element={<MerchantForm />} />
          <Route path="/order/merchant/create/:orderId" element={<MerchantForm />} />
          
          {/* Delivery agent routes */}
          <Route path="/order/delivery" element={<DeliveryScan />} />
          <Route path="/order/delivery/:orderId" element={<DeliveryScanner />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
