import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Hash, Scan, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/QRScanner';
import { toast } from '@/hooks/use-toast';
import { merchantOrderAPI } from '@/lib/api';

const MerchantUniqueScan = () => {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const [scannerOpen, setScannerOpen] = useState(false);
   const [processing, setProcessing] = useState(false);
   const [status, setStatus] = useState<string>('');

   // Check for encrypted token in URL on mount
   useEffect(() => {
     const token = searchParams.get('qrId');
     if (token) {
       handleDecryptToken(token);
     }
   }, [searchParams]);

   const handleDecryptToken = async (encryptedToken: string) => {
     setProcessing(true);
     setStatus('Decrypting order ID...');

     try {
    //    const result = await merchantOrderAPI.decryptOrderId(encryptedToken);
        const result = {success: true, orderId: encryptedToken};

    //    if (result.success && result.orderId) {
         setStatus('Checking order status...');

         // Check if order exists
         const existingOrder = await merchantOrderAPI.getOrder(result.orderId);

         if (existingOrder.success) {
           toast({
             title: 'Order Found',
             description: `Loading order #${result.orderId} for update.`,
           });
           navigate(`/order/merchant/update/${result.orderId}`);
         } else {
           toast({
             title: 'New Order',
             description: `Creating new order with ID: ${result.orderId}`,
           });
           navigate(`/order/merchant/create/${result.orderId}`);
         }
    //    } else {
    //      toast({
    //        title: 'Decryption Failed',
    //        description: result.message || 'Could not decrypt the order ID. Please try again.',
    //        variant: 'destructive',
    //      });
    //      setProcessing(false);
    //    }
     } catch (error) {
       console.error('Decryption error:', error);
       toast({
         title: 'Error',
         description: 'Failed to process the QR code. Please try again.',
         variant: 'destructive',
       });
       setProcessing(false);
     }
   };

   const handleScanSuccess = (scannedData: string) => {
     setScannerOpen(false);

     // Extract token from URL if present
     try {
       const url = new URL(scannedData);
       const token = url.searchParams.get('qrId');

       if (token) {
         handleDecryptToken(token);
       } else {
         // Check if the scanned data itself is the token
         handleDecryptToken(scannedData);
       }
     } catch {
       // Not a valid URL, treat as raw token
       handleDecryptToken(scannedData);
     }
   };

   const handleBackToLanding = () => {
     navigate('/order/merchant');
   };

   return (
    <div className="min-h-[100svh] bg-background">
      <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center gap-4 px-4 py-6">
           {processing ? (
             <div className="text-center space-y-4">
               <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-merchant/10">
                 <Loader2 className="h-8 w-8 text-merchant animate-spin" />
               </div>
               <div>
                 <h2 className="text-lg font-semibold">Processing</h2>
                 <p className="mt-1 text-sm text-muted-foreground">{status}</p>
               </div>
             </div>
           ) : (
             <>
               <div className="text-center">
                 <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-merchant/10">
                   <Scan className="h-6 w-6 text-merchant" />
                 </div>
                 <h2 className="mt-2 text-lg font-semibold">Scan Unique QR Code</h2>
                 <p className="mt-1 text-sm text-muted-foreground">
                   Scan the encrypted QR code to automatically extract the order ID
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

               <Button
              variant="ghost"
              className="w-full"
              onClick={handleBackToLanding}
            >
              Back to Template Selection
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

 export default MerchantUniqueScan;