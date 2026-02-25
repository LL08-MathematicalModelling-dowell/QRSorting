import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Package, User, FileText, Plus, Trash2, Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { AudioRecorder } from '@/components/AudioRecorder';
import { ImageUploader } from '@/components/ImageUploader';
// import { getOrder, updateOrder, createOrder } from '@/lib/mockData';
import { OrderStatus, OrderItem, GarmentSpecification, Order, OrderUpdate } from '@/types/order';
import { toast } from '@/hooks/use-toast';
import { merchantOrderAPI } from '@/lib/api';
import { base64ToBlob } from '@/lib/utils';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
];

const MerchantForm = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  const scan_id = sessionStorage.getItem('scan_id');
 
  // Determine if this is a create or update based on route
  const isCreateRoute = location.pathname.includes('/order/merchant/create/');
  const [isNewOrder, setIsNewOrder] = useState(isCreateRoute);
  
  const [formData, setFormData] = useState({
    merchantName: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    status: 'pending' as OrderStatus,
    estimatedDelivery: '',
    notes: '',
    items: [{ 
      id: '1', 
      garmentType: '', 
      quantity: 1, 
      price: 0, 
      specifications: [{ id: '1', fieldName: '', value: '' }] 
    }] as OrderItem[],
    audioBlob: undefined,
    imageBlob: undefined
  });

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {

    if (isCreateRoute) {
      // Creating new order - no need to fetch
      setIsNewOrder(true);
      setLoading(false);
      return;
    }

    // Updating existing order
    if (orderId) {
      const order = await merchantOrderAPI.getOrder(orderId);
      if (order.success) {
        console.log("AUDIO BUFFER:", order.audioBuffer, order.audioType);
        console.log("IMAGE BUFFER:", order.imageBuffer, order.imageType);
        if (order.audioBuffer && order.audioType) {
          const audio = base64ToBlob(order.audioBuffer, order.audioType);
          console.log("AUDIO BLOB:", audio, audio.size);
          setAudioBlob(audio);
        }

        if (order.imageBuffer && order.imageType) {
          const image = base64ToBlob(order.imageBuffer, order.imageType);
          console.log("IMAGE BLOB:", image, image.size);
          setImageBlob(image);
        }

        setFormData({
          merchantName: sessionStorage.getItem("businessName"),
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          status: order.status,
          estimatedDelivery: order.estimatedDelivery || '',
          notes: order.notes || '',
          items: order.items,
          audioBlob: undefined,
          imageBlob: undefined
        });
        setIsNewOrder(false);
        // Expand all items when editing
        setExpandedItems(new Set(order.items.map((_, i) => i)));
        setLoading(false);
      } else {
        // Order not found, redirect to create
        toast({
          title: 'Order Not Found',
          description: 'Redirecting to create new order.',
          variant: 'destructive',
        });
        navigate(`/order/merchant/create/${orderId}`, { replace: true });
        return;
      }
    }
    };

    fetchOrder();
    // setLoading(false);
  }, [orderId, isCreateRoute, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty items and specifications
      const cleanedItems = formData.items
        .filter(item => item.garmentType)
        .map(item => ({
          ...item,
          specifications: item.specifications.filter(spec => spec.fieldName || spec.value)
        }));

      if (isNewOrder) {
        const newOrder: Order = {
          orderId: orderId,
          merchantName: formData.merchantName,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          items: cleanedItems,
          status: formData.status,
          // pickupLocation: { lat: 40.7128, lng: -74.006, timestamp: Date.now() },
          // deliveryLocation: { lat: 40.7282, lng: -73.9942, timestamp: 0 },
          estimatedDelivery: formData.estimatedDelivery || undefined,
          notes: formData.notes || undefined,
          audioBlob: audioBlob || undefined,
          imageBlob: imageBlob || undefined,
          ...(scan_id && { scanId: scan_id })
        };

        const orderResponse = await merchantOrderAPI.createOrder(newOrder);
        if (orderResponse.success) {
            toast({
            title: 'Order Created',
            description: `Order ${newOrder.orderId} has been created successfully.`,
          });
          
          navigate(`/order/merchant/update/${newOrder.orderId}`);
        } else  {
          toast({
            title: 'Error',
            description: 'Failed to create order. Please try again.',
            variant: 'destructive',
          });
        }
        
        
      } else {
        const updatedOrder: OrderUpdate = {
          orderId: orderId,
          status: formData.status,
          ...(scan_id && { scanId: scan_id })
        }
        const updateResponse = await merchantOrderAPI.updateOrder(updatedOrder);
        if (!updateResponse.success) {
          toast({
            title: 'Error',
            description: 'Failed to update order. Please try again.',
            variant: 'destructive',
          });
        }else {
            toast({
            title: 'Order Updated',
            description: 'Order details have been saved successfully.',
          });
          navigate('/order/merchant');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Item management
  const addItem = () => {
    const newIndex = formData.items.length;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: String(newIndex + 1), 
        garmentType: '', 
        quantity: 1, 
        price: 0,
        specifications: [{ id: '1', fieldName: '', value: '' }]
      }],
    }));
    setExpandedItems(prev => new Set([...prev, newIndex]));
  };

  const updateItem = (index: number, field: keyof Omit<OrderItem, 'specifications'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const toggleItemExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Specification management
  const addSpecification = (itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex) {
          return {
            ...item,
            specifications: [
              ...item.specifications,
              { id: String(item.specifications.length + 1), fieldName: '', value: '' }
            ]
          };
        }
        return item;
      }),
    }));
  };

  const updateSpecification = (
    itemIndex: number, 
    specIndex: number, 
    field: keyof GarmentSpecification, 
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex) {
          return {
            ...item,
            specifications: item.specifications.map((spec, j) =>
              j === specIndex ? { ...spec, [field]: value } : spec
            )
          };
        }
        return item;
      }),
    }));
  };

  const removeSpecification = (itemIndex: number, specIndex: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex && item.specifications.length > 1) {
          return {
            ...item,
            specifications: item.specifications.filter((_, j) => j !== specIndex)
          };
        }
        return item;
      }),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-merchant border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 gradient-merchant"
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 text-merchant-foreground">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-merchant-foreground hover:bg-merchant-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">
                {isNewOrder ? 'Create Order' : 'Update Order'}
              </h1>
              {!isNewOrder && <p className="text-sm opacity-90">#{orderId}</p>}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-merchant" />
              Business Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="merchantName">Business Name</Label>
                <Input
                  id="merchantName"
                  value={formData.merchantName}
                  onChange={(e) => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
                  placeholder="Your business name"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-merchant" />
              Customer Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+1 555-0123"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="customerAddress">Delivery Address</Label>
                <Input
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Full delivery address"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Order Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-merchant" />
              Order Specifications
            </h2>
            
            <div className="space-y-4">
              {formData.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border border-border rounded-xl overflow-hidden">
                  {/* Garment Header */}
                  <div 
                    className="bg-muted/50 p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleItemExpanded(itemIndex)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                        #{itemIndex + 1}
                      </span>
                      <span className="font-medium">
                        {item.garmentType || 'New Garment'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({item.specifications.filter(s => s.fieldName).length} specs)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(itemIndex);
                        }}
                        disabled={formData.items.length === 1}
                        className="text-destructive hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedItems.has(itemIndex) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Garment Details (Expandable) */}
                  {expandedItems.has(itemIndex) && (
                    <div className="p-4 space-y-4">
                      {/* Garment basic info */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                          <Label>Garment Type</Label>
                          <Input
                            value={item.garmentType}
                            onChange={(e) => updateItem(itemIndex, 'garmentType', e.target.value)}
                            placeholder="e.g., Shirt, Trousers, Kurta"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.price}
                            onChange={(e) => updateItem(itemIndex, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Specifications */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Measurements & Specifications</Label>
                        <div className="space-y-2">
                          {item.specifications.map((spec, specIndex) => (
                            <div key={specIndex} className="flex gap-2 items-center">
                              <div className="flex-1">
                                <Input
                                  value={spec.fieldName}
                                  onChange={(e) => updateSpecification(itemIndex, specIndex, 'fieldName', e.target.value)}
                                  placeholder="Field name (e.g., Chest, Waist)"
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={spec.value}
                                  onChange={(e) => updateSpecification(itemIndex, specIndex, 'value', e.target.value)}
                                  placeholder="Value (e.g., 42 inches)"
                                  className="text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSpecification(itemIndex, specIndex)}
                                disabled={item.specifications.length === 1}
                                className="text-destructive hover:text-destructive h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          className="mt-2 text-primary"
                          onClick={() => addSpecification(itemIndex)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Specification
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" className="mt-4 w-full" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Garment
            </Button>
          </motion.div>

          {/* Status & Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-merchant" />
              Order Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Order Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: OrderStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                <Input
                  id="estimatedDelivery"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  placeholder="e.g., 3-5 days"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Delivery Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                  rows={3}
                />
                <div>
                  <Label className="mb-2 block">Garment Sample Image (Optional)</Label>
                  <ImageUploader
                    existingImageBlob={imageBlob || undefined}
                    onImageSelected={setImageBlob}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Voice Note (Optional)</Label>
                  <AudioRecorder
                    existingAudioBlob={audioBlob || undefined}
                    onAudioRecorded={setAudioBlob}
                  />
                </div>
                
              </div>
            </div>
          </motion.div>
          
          {/* QR Codes (for existing orders) */}
          {!isNewOrder && orderId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <QRCodeDisplay orderId={orderId} showDeliveryQR={true} />
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="submit"
              size="lg"
              className="w-full gradient-merchant text-merchant-foreground font-semibold"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isNewOrder ? 'Create Order' : 'Save Changes'}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default MerchantForm;