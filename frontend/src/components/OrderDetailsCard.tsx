import { motion } from 'framer-motion';
import { Store, Ruler, MapPin, Phone, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Order, OrderItem } from '@/types/order';

interface OrderDetailsCardProps {
  order: Order;
}

const GarmentItemCard = ({ item }: { item: OrderItem }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            {item.quantity}x
          </span>
          <span className="text-sm font-medium">{item.garmentType}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {expanded && item.specifications.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
          {item.specifications.map((spec) => (
            <div key={spec.id} className="text-xs">
              <span className="text-muted-foreground">{spec.fieldName}: </span>
              <span className="font-medium">{spec.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OrderDetailsCard = ({ order }: OrderDetailsCardProps) => {
  const totalAmount = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="gradient-merchant p-4 text-merchant-foreground">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{order.merchantName}</h3>
            <p className="text-sm opacity-90">Order #{order.orderId}</p>
          </div>
        </div>
      </div>

      {/* Order Specifications */}
      {order.items && order.items.length > 0 && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Order Specifications</h4>
          </div>
          <div className="space-y-4">
            {order.items.map((item) => (
              <GarmentItemCard key={item.id} item={item} />
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-lg">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Delivery Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-medium">{order.customerName}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium">{order.customerPhone}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Delivery Address</p>
            <p className="text-sm font-medium">{order.customerAddress}</p>
          </div>
        </div>

        {order.notes && (
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm font-medium">{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderDetailsCard;