import { motion } from 'framer-motion';
import { Package, ChefHat, CheckCircle2, Truck, MapPin, Clock } from 'lucide-react';
import { OrderStatus } from '@/types/order';

interface OrderStatusDisplayProps {
  status: OrderStatus;
  estimatedDelivery?: string;
}

const statusConfig = {
  pending: {
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: Clock,
    color: 'bg-warning',
    progress: 10,
  },
  preparing: {
    label: 'Preparing',
    description: 'Your order is being prepared',
    icon: ChefHat,
    color: 'bg-info',
    progress: 30,
  },
  ready: {
    label: 'Ready for Pickup',
    description: 'Order is ready and waiting for driver',
    icon: Package,
    color: 'bg-merchant',
    progress: 50,
  },
  picked_up: {
    label: 'Picked Up',
    description: 'Driver has picked up your order',
    icon: CheckCircle2,
    color: 'bg-delivery',
    progress: 65,
  },
  in_transit: {
    label: 'On the Way',
    description: 'Your order is being delivered',
    icon: Truck,
    color: 'bg-delivery',
    progress: 80,
  },
  delivered: {
    label: 'Delivered',
    description: 'Enjoy your order!',
    icon: MapPin,
    color: 'bg-success',
    progress: 100,
  },
};

const steps: OrderStatus[] = ['pending', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered'];

export const OrderStatusDisplay = ({ status, estimatedDelivery }: OrderStatusDisplayProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const currentStepIndex = steps.indexOf(status);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className={`w-16 h-16 ${config.color} rounded-2xl flex items-center justify-center shadow-soft-md`}
          >
            <StatusIcon className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{config.label}</h2>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${config.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${config.color} rounded-full`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Order Placed</span>
            <span>Delivered</span>
          </div>
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && status !== 'delivered' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex items-center gap-2 text-sm"
          >
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Estimated arrival:</span>
            <span className="font-semibold text-foreground">{estimatedDelivery}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Timeline */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Order Progress</h3>
        <div className="space-y-0">
          {steps.map((step, index) => {
            const stepConfig = statusConfig[step];
            const StepIcon = stepConfig.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[19px] top-10 w-0.5 h-8 ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
                
                {/* Icon */}
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground shadow-soft-md'
                      : isCompleted
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ opacity: 0.3, zIndex: -1 }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="pb-8">
                  <p
                    className={`font-medium ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {stepConfig.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{stepConfig.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDisplay;
