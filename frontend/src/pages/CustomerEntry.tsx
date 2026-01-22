import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Hash, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { getOrder } from '@/lib/mockData';
import { merchantOrderAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const CustomerEntry = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [checking, setChecking] = useState(false);

  const handleCheckOrder = async () => {
    if (!orderId.trim()) {
      toast({
        title: 'Order ID Required',
        description: 'Please enter an order ID to track your delivery.',
        variant: 'destructive',
      });
      return;
    }

    setChecking(true);
    
    // Simulate API check delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const existingOrder = await merchantOrderAPI.getOrder(orderId.trim());
    
    if (existingOrder.success) {
      toast({
        title: 'Order Found',
        description: `Loading tracking details for order #${orderId}`,
      });
      navigate(`/order/${orderId.trim()}`);
    } else {
      toast({
        title: 'Order Not Found',
        description: `No order exists with ID: ${orderId}. Please check the ID and try again.`,
        variant: 'destructive',
      });
    }
    
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-primary"
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 text-primary-foreground">
            <Package className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Track Your Order</h1>
              <p className="text-sm opacity-90">Real-time delivery updates</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Enter Order ID</h2>
            <p className="text-muted-foreground">
              Enter your order ID to see live tracking updates
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., ORD-001"
                className="mt-1.5"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCheckOrder()}
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can find your order ID in the confirmation email or message.
              </p>
            </div>

            <Button
              className="w-full font-semibold"
              onClick={handleCheckOrder}
              disabled={checking || !orderId.trim()}
            >
              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  Track Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Having trouble? Contact the merchant who sent you the tracking link.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CustomerEntry;
