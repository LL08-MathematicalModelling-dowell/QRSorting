import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Hash, ArrowRight, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRScanner } from '@/components/QRScanner';
// import { getOrder } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { merchantOrderAPI } from '@/lib/api';

type Step = 'scan' | 'orderId';

const MerchantScan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('scan');
  const [orderId, setOrderId] = useState('');
  const [checking, setChecking] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScanSuccess = (scannedData: string) => {
    // Extract order ID from URL if scanned
    // const orderIdMatch = scannedData.match(/order\/([^/?]+)/);
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
    // await new Promise(resolve => setTimeout(resolve, 500));

    const existingOrder = await merchantOrderAPI.getOrder(orderId.trim());
    
    if (existingOrder.success) {
      toast({
        title: 'Order Found',
        description: `Loading order #${orderId} for update.`,
      });
      navigate(`/order/merchant/update/${orderId.trim()}`);
    } else {
      toast({
        title: 'New Order',
        description: `Creating new order with ID: ${orderId}`,
      });
      navigate(`/order/merchant/create/${orderId.trim()}`);
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
    <div className="min-h-[100svh] bg-background">
      <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center gap-4 px-4 py-6">
        {step === 'scan' && (
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-merchant/10">
                <Scan className="h-6 w-6 text-merchant" />
              </div>
              <h2 className="mt-2 text-lg font-semibold">Scan QR Code</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan an order QR code to get started
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gradient-merchant text-merchant-foreground font-semibold"
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

            </>
        )}

        {step === 'orderId' && (
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-merchant/10">
                <Hash className="h-6 w-6 text-merchant" />
              </div>
              <h2 className="mt-2 text-lg font-semibold">Enter Order ID</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the order ID to create or update an order
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., ORD-001 or any unique ID"
                  className="mt-1.5"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckOrder()}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  If the order exists, you'll update it. Otherwise, a new order will be created.
                </p>
              </div>

              <Button
                className="w-full gradient-merchant text-merchant-foreground font-semibold"
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

            </>
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

export default MerchantScan;