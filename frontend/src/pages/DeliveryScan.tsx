import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, QrCode, Hash, ArrowRight, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRScanner } from '@/components/QRScanner';
// import { getOrder } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { merchantOrderAPI } from '@/lib/api';

type Step = 'scan' | 'orderId';

const DeliveryScan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('scan');
  const [orderId, setOrderId] = useState('');
  const [checking, setChecking] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScanSuccess = (scannedData: string) => {
    // Extract order ID from URL if scanned
    const orderIdMatch = scannedData.match(/order\/([^/?]+)/);
    // if (orderIdMatch) {
    //   setOrderId(orderIdMatch[1]);
    // } else {
    //   setOrderId(scannedData);
    // }
    setStep('orderId');
  };

  const handleCheckOrder = async () => {
    if (!orderId.trim()) {
      toast({
        title: 'Order ID Required',
        description: 'Please enter an order ID to continue.',
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
        description: `Proceeding to capture location for order #${orderId}`,
      });
      navigate(`/order/delivery/${orderId.trim()}`);
    } else {
      toast({
        title: 'Order Not Found',
        description: `No order exists with ID: ${orderId}`,
        variant: 'destructive',
      });
    }
    
    setChecking(false);
  };

  const handleSkipScan = () => {
    setStep('orderId');
  };

  const handleBackToScan = () => {
    setStep('scan');
    setOrderId('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 gradient-delivery"
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 text-delivery-foreground">
            <Truck className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">DoWell Smart Labelling</h1>
              <p className="text-sm opacity-90">Delivery Portal</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-xl mx-auto px-4 py-8">
        {step === 'scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-delivery/10 mb-4">
                <Scan className="w-8 h-8 text-delivery" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Scan QR Code</h2>
              <p className="text-muted-foreground">
                Scan QR code to update your location
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gradient-delivery text-delivery-foreground font-semibold"
              onClick={() => setScannerOpen(true)}
            >
              <QrCode className="w-5 h-5 mr-2" />
              Open Scanner
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleSkipScan}
            >
              <Hash className="w-4 h-4 mr-2" />
              Enter Order ID Manually
            </Button>
          </motion.div>
        )}

        {step === 'orderId' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-delivery/10 mb-4">
                <Hash className="w-8 h-8 text-delivery" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Enter Order ID</h2>
              <p className="text-muted-foreground">
                Enter the order ID to capture your location
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
                  Your current location will be captured for this order.
                </p>
              </div>

              <Button
                className="w-full gradient-delivery text-delivery-foreground font-semibold"
                onClick={handleCheckOrder}
                disabled={checking || !orderId.trim()}
              >
                {checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleBackToScan}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Back to Scanner
            </Button>
          </motion.div>
        )}
      </main>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanSuccess}
        onError={(error) => console.error('Scan error:', error)}
      />
    </div>
  );
};

export default DeliveryScan;
