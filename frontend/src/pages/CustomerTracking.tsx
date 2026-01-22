import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackingMap } from '@/components/TrackingMap';
import { OrderStatusDisplay } from '@/components/OrderStatusDisplay';
import { OrderDetailsCard } from '@/components/OrderDetailsCard';
import { merchantOrderAPI, scanAPI } from '@/lib/api';
import { Order, ScanDetail } from '@/types/order';

const CustomerTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    try {
      // Fetch order details and scan history in parallel
      const [orderData, scanData] = await Promise.all([
        merchantOrderAPI.getOrder(orderId),
        scanAPI.getScans(orderId, lastUpdated.toISOString()),
      ]);

      console.log("Order data:", orderData);
      console.log("Scan data:", scanData);

      if (!orderData || !orderData.success) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      setOrder(orderData);
      
      if (scanData.success && scanData.scanDetails) {
        // Sort scans by timestamp (oldest first)
        const sortedScans = [...scanData.scanDetails].sort(
          (a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
        );
        setScanHistory(sortedScans);
      }
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load order details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Poll for updates every 10 seconds
    // const interval = setInterval(fetchData, 10000);
    // return () => clearInterval(interval);
  }, [orderId]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(fetchData, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'We couldn\'t find the order you\'re looking for. Please check the tracking link and try again.'}
          </p>
          <Button onClick={() => navigate('/order')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Track Another Order
          </Button>
        </motion.div>
      </div>
    );
  }

  // Determine if we should show the map (has scan history with location data)
  const showMap = scanHistory.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/order')}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Track Order</h1>
                <p className="text-sm text-muted-foreground">#{order.orderId}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Live Map */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              Tracking Details
            </h2>
            <TrackingMap
              scanHistory={scanHistory}
              className="h-[300px]"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Last updated: {lastUpdated.toLocaleTimeString()} • {scanHistory.length} location update{scanHistory.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        )}

        {/* Status Display */}
        <OrderStatusDisplay
          status={order.status || 'pending'}
          estimatedDelivery={order.estimatedDelivery}
        />

        {/* Order Details */}
        <OrderDetailsCard order={order} />
      </main>
    </div>
  );
};

export default CustomerTracking;
