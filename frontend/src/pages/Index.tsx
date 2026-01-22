import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Truck, Package, QrCode, ChevronRight, Scan, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRScanner } from '@/components/QRScanner';
import { UserRole } from '@/types/order';
import { generateDemoOrderId } from '@/lib/mockData';

const roleConfig = {
  merchant: {
    title: 'Merchant',
    description: 'Create and manage orders',
    icon: Store,
    gradient: 'gradient-merchant',
    color: 'text-merchant',
    bgLight: 'bg-merchant/10',
  },
  delivery: {
    title: 'Delivery Agent',
    description: 'Update delivery location',
    icon: Truck,
    gradient: 'gradient-delivery',
    color: 'text-delivery',
    bgLight: 'bg-delivery/10',
  },
  customer: {
    title: 'Customer',
    description: 'Track your order',
    icon: Package,
    gradient: 'gradient-customer',
    color: 'text-customer',
    bgLight: 'bg-customer/10',
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualOrderId, setManualOrderId] = useState('');

  const handleScan = (result: string) => {
    // Extract order ID from URL
    const match = result.match(/\/track\/([A-Za-z0-9-]+)/);
    const orderId = match ? match[1] : result;

    if (selectedRole === 'merchant') {
      navigate(`/order/merchant/update/${orderId}`);
    } else if (selectedRole === 'delivery') {
      navigate(`/order/delivery/${orderId}`);
    } else {
      navigate(`/order/${orderId}`);
    }
  };

  const handleManualEntry = () => {
    if (!manualOrderId.trim()) return;

    if (selectedRole === 'merchant') {
      navigate(`/order/merchant/update/${manualOrderId}`);
    } else if (selectedRole === 'delivery') {
      navigate(`/order/delivery/${manualOrderId}`);
    } else {
      navigate(`/order/${manualOrderId}`);
    }
  };

  const handleDemoOrder = () => {
    const demoId = generateDemoOrderId();
    navigate(`/order/${demoId}`);
  };

  const handleCreateNewOrder = () => {
    navigate('/order/merchant/update/new');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative container max-w-6xl mx-auto px-4 py-12 md:py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-medium">QR-Based Tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Smart Delivery</span>
              <br />
              <span className="text-foreground">Tracking System</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Seamlessly coordinate between merchants, delivery agents, and customers with dynamic QR codes
            </p>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12"
          >
            {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.merchant][]).map(
              ([role, config], index) => {
                const Icon = config.icon;
                const isSelected = selectedRole === role;

                return (
                  <motion.button
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => setSelectedRole(role)}
                    className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? `border-current ${config.color} bg-card shadow-soft-lg`
                        : 'border-border bg-card/50 hover:bg-card hover:border-border hover:shadow-soft'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl ${config.bgLight} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                    >
                      <Icon className={`w-7 h-7 ${config.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    
                    {isSelected && (
                      <motion.div
                        layoutId="selected-indicator"
                        className={`absolute top-4 right-4 w-6 h-6 ${config.gradient} rounded-full flex items-center justify-center`}
                      >
                        <ChevronRight className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              }
            )}
          </motion.div>

          {/* Action Buttons */}
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-semibold mb-6 text-center">
                Continue as {roleConfig[selectedRole].title}
              </h2>

              <div className="space-y-4">
                {/* QR Scanner Button */}
                <Button
                  size="lg"
                  className={`w-full ${roleConfig[selectedRole].gradient} text-primary-foreground font-semibold`}
                  onClick={() => setScannerOpen(true)}
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Manual Entry */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Order ID (e.g., ORD-001)"
                    value={manualOrderId}
                    onChange={(e) => setManualOrderId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                  />
                  <Button variant="outline" onClick={handleManualEntry}>
                    Go
                  </Button>
                </div>

                {/* Merchant: Create New Order */}
                {selectedRole === 'merchant' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCreateNewOrder}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Create New Order
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Demo Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <button
              onClick={handleDemoOrder}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Map className="w-4 h-4" />
              <span>View Demo Order Tracking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="container max-w-6xl mx-auto px-4 py-16 border-t border-border"
      >
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-merchant/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-merchant" />
            </div>
            <h3 className="font-semibold mb-2">Easy Order Management</h3>
            <p className="text-sm text-muted-foreground">
              Merchants can create, update, and track orders with a simple scan
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-delivery/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-delivery" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Location</h3>
            <p className="text-sm text-muted-foreground">
              Automatic geolocation capture for delivery agents on each scan
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-customer/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Map className="w-6 h-6 text-customer" />
            </div>
            <h3 className="font-semibold mb-2">Live Map Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Customers see live delivery location on an interactive map
            </p>
          </div>
        </div>
      </motion.section>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        onError={(error) => console.error('Scan error:', error)}
      />
    </div>
  );
};

export default Index;
