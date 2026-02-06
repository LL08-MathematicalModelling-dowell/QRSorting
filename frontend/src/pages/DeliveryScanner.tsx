import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle, AlertCircle, Loader2, ArrowLeft, Navigation, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { merchantOrderAPI, scanAPI } from '@/lib/api';
import { ScanningUpdate, OrderStatus } from '@/types/order';
import { LocationPreviewMap } from '@/components/LocationPreviewMap';

type LocationState = 'idle' | 'selecting_status' | 'requesting' | 'previewing' | 'saving' | 'success' | 'error' | 'denied';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
];

const DeliveryScanner = () => {
  const { orderId } = useParams<{ orderId: string }>();
  console.log("Order ID:", orderId);
  const navigate = useNavigate();
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('in_transit');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [orderExists, setOrderExists] = useState<boolean | null>(null);

  // Check if order exists on mount
  useEffect(() => {
    const checkOrder = async () => {
      if (!orderId) {
        setLocationState('error');
        setErrorMessage('No order ID provided');
        return;
      }

      try {
        const order = await merchantOrderAPI.getOrder(orderId);
        if (!order || !order.success) {
          setLocationState('error');
          setErrorMessage('Order not found');
          setOrderExists(false);
          return;
        }
        setOrderExists(true);
        setLocationState('selecting_status');
      } catch {
        setLocationState('error');
        setErrorMessage('Failed to verify order');
        setOrderExists(false);
      }
    };

    checkOrder();
  }, [orderId]);

  const captureLocation = useCallback(() => {
    if (!orderId) {
      setLocationState('error');
      setErrorMessage('No order ID provided');
      return;
    }

    setLocationState('requesting');

    if (!navigator.geolocation) {
      setLocationState('error');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocationState('previewing');  
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationState('denied');
            setErrorMessage('Location permission was denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationState('error');
            setErrorMessage('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setLocationState('error');
            setErrorMessage('Location request timed out. Please try again.');
            break;
          default:
            setLocationState('error');
            setErrorMessage('An unknown error occurred while getting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [orderId]);

  const saveLocation = useCallback(async () => {
    if (!orderId || !coordinates) return;

    setLocationState('saving');

    const scan: ScanningUpdate = {
      orderId: orderId,
      location: {
        latitude: coordinates.lat,
        longitude: coordinates.lng
      },
      status: selectedStatus,
      scannedAt: new Date().toISOString()
    };

    const scanResult = await scanAPI.insertScan(scan);
    console.log(scanResult);

    if (scanResult.success) {
      setLocationState('success');
      toast({
        title: 'Location Updated',
        description: `Successfully captured location for order #${orderId} with status: ${selectedStatus}`,
      });
    } else {
      setLocationState('previewing');
      toast({
        title: 'Location Update Failed',
        description: `Failed to save location for order #${orderId}. Please try again.`,
        variant: 'destructive',
      });
    }
  }, [orderId, coordinates, selectedStatus]);
  const handleRetry = () => {
    setLocationState('selecting_status');
    setErrorMessage('');
    setCoordinates(null);
  };

  const handleCaptureLocation = () => {
    captureLocation();
  };

  const handleRecapture = () => {
    setCoordinates(null);
    captureLocation();
  };

  const getStatusLabel = (status: OrderStatus): string => {
    return statusOptions.find(opt => opt.value === status)?.label || status;
  };

  const renderContent = () => {
    switch (locationState) {
      case 'idle':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 gradient-delivery rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <Loader2 className="w-12 h-12 text-delivery-foreground animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verifying Order</h2>
            <p className="text-muted-foreground">
              Please wait while we verify the order...
            </p>
          </motion.div>
        );

      case 'selecting_status':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 gradient-delivery rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <MapPin className="w-12 h-12 text-delivery-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Update Delivery Status</h2>
              <p className="text-muted-foreground">
                Select the current order status before capturing location
              </p>
            </div>
            
            <div className="max-w-xs mx-auto space-y-4">
              <div className="text-left">
                <Label htmlFor="status-select" className="text-sm font-medium mb-2 block">
                  Order Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                >
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleCaptureLocation} 
                className="w-full gradient-delivery text-delivery-foreground"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Capture Location
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => navigate('/order/delivery')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scanner
            </Button>
          </motion.div>
        );

      case 'requesting':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 gradient-delivery rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <Loader2 className="w-12 h-12 text-delivery-foreground animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Capturing Location</h2>
            <p className="text-muted-foreground">
              Status: <span className="font-medium">{getStatusLabel(selectedStatus)}</span>
            </p>
            <p className="text-muted-foreground">
              Please wait while we get your current location...
            </p>
          </motion.div>
        );

        case 'previewing':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">Confirm Your Location</h2>
              <p className="text-muted-foreground">
                Status: <span className="font-semibold">{getStatusLabel(selectedStatus)}</span>
              </p>
            </div>
            
            {coordinates && (
              <>
                <LocationPreviewMap 
                  coordinates={coordinates} 
                  className="w-full"
                />
                
                <div className="bg-muted rounded-lg p-3 inline-block">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="w-4 h-4 text-delivery" />
                    <span className="font-mono">
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button 
                onClick={saveLocation} 
                className="w-full gradient-delivery text-delivery-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                Confirm & Save Location
              </Button>
              <Button variant="outline" onClick={handleRecapture}>
                <MapPin className="w-4 h-4 mr-2" />
                Recapture Location
              </Button>
              <Button variant="ghost" onClick={() => navigate('/order/delivery')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </motion.div>
        );

      case 'saving':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 gradient-delivery rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <Loader2 className="w-12 h-12 text-delivery-foreground animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Saving Location</h2>
            <p className="text-muted-foreground">
              Please wait while we save your location update...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-lg"
            >
              <CheckCircle className="w-12 h-12 text-success-foreground" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 text-success">Location Updated!</h2>
            <p className="text-muted-foreground mb-2">
              Your location has been successfully recorded for order #{orderId}
            </p>
            <p className="text-muted-foreground mb-4">
              Status: <span className="font-semibold">{getStatusLabel(selectedStatus)}</span>
            </p>
            {coordinates && (
              <div className="bg-muted rounded-lg p-4 mb-6 inline-block">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="w-4 h-4 text-delivery" />
                  <span className="font-mono">
                    {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} className="gradient-delivery text-delivery-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                Update Location Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/order/delivery')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scanner
              </Button>
            </div>
          </motion.div>
        );

      case 'denied':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-warning" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Location Access Denied</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6 text-left text-sm">
              <p className="font-medium mb-2">To enable location access:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Location" in the permissions list</li>
                <li>Change it to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry}>Try Again</Button>
              <Button variant="outline" onClick={() => navigate('/order/delivery')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scanner
              </Button>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              {orderExists && (
                <Button onClick={handleRetry}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/order/delivery')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scanner
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-delivery"
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 text-delivery-foreground">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/order/delivery')}
              className="text-delivery-foreground hover:bg-delivery-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">Delivery Update</h1>
              <p className="text-sm opacity-90">Order #{orderId}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card rounded-2xl p-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default DeliveryScanner;
