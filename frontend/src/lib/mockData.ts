import { Order, DeliveryAgent, OrderStatus } from '@/types/order';

// Mock orders database
const orders: Map<string, Order> = new Map();

// Mock delivery agents
const deliveryAgents: Map<string, DeliveryAgent> = new Map();

// Initialize with sample data
const sampleOrders: Order[] = [
  {
    orderId: 'ORD-001',
    merchantName: 'Urban Eats Restaurant',
    customerName: 'John Smith',
    customerPhone: '+1 555-0123',
    customerAddress: '123 Main Street, Downtown',
    items: [
      { 
        id: '1', 
        garmentType: 'Formal Shirt', 
        quantity: 2, 
        price: 45.00, 
        specifications: [
          { id: '1', fieldName: 'Chest', value: '42 inches' },
          { id: '2', fieldName: 'Collar', value: '16 inches' },
          { id: '3', fieldName: 'Sleeve Length', value: '25 inches' },
          { id: '4', fieldName: 'Fabric', value: 'Cotton' },
        ]
      },
      { 
        id: '2', 
        garmentType: 'Trousers', 
        quantity: 1, 
        price: 35.00, 
        specifications: [
          { id: '1', fieldName: 'Waist', value: '34 inches' },
          { id: '2', fieldName: 'Length', value: '42 inches' },
          { id: '3', fieldName: 'Style', value: 'Pleated' },
        ]
      },
    ],
    status: 'in_transit',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    pickupLocation: { lat: 40.7128, lng: -74.006, timestamp: Date.now() - 1800000 },
    deliveryLocation: { lat: 40.7282, lng: -73.9942, timestamp: 0 },
    estimatedDelivery: '15-20 min',
    notes: 'Please ring doorbell twice',
  },
  {
    orderId: 'ORD-002',
    merchantName: 'Pizza Paradise',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 555-0456',
    customerAddress: '456 Oak Avenue, Midtown',
    items: [
      { 
        id: '1', 
        garmentType: 'Traditional Kurta', 
        quantity: 1, 
        price: 55.00, 
        specifications: [
          { id: '1', fieldName: 'Chest', value: '40 inches' },
          { id: '2', fieldName: 'Length', value: '38 inches' },
          { id: '3', fieldName: 'Shoulder', value: '18 inches' },
        ]
      },
      { 
        id: '2', 
        garmentType: 'Pajama', 
        quantity: 1, 
        price: 25.00, 
        specifications: [
          { id: '1', fieldName: 'Waist', value: '32 inches' },
          { id: '2', fieldName: 'Length', value: '40 inches' },
        ]
      },
    ],
    status: 'preparing',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 900000,
    pickupLocation: { lat: 40.7589, lng: -73.9851, timestamp: 0 },
    deliveryLocation: { lat: 40.7614, lng: -73.9776, timestamp: 0 },
    estimatedDelivery: '30-40 min',
  },
];

const sampleAgents: DeliveryAgent[] = [
  {
    id: 'A001',
    name: 'Mike Rodriguez',
    phone: '+1 555-0789',
    currentLocation: { lat: 40.7200, lng: -74.0000, timestamp: Date.now() },
    locationHistory: [
      { lat: 40.7128, lng: -74.006, timestamp: Date.now() - 600000 },
      { lat: 40.7150, lng: -74.003, timestamp: Date.now() - 300000 },
      { lat: 40.7200, lng: -74.0000, timestamp: Date.now() },
    ],
  },
];

// Initialize data
sampleOrders.forEach(order => orders.set(order.orderId, order));
sampleAgents.forEach(agent => deliveryAgents.set(agent.id, agent));

// API functions
export const getOrder = (orderId: string): Order | undefined => {
  return orders.get(orderId);
};

export const getAllOrders = (): Order[] => {
  return Array.from(orders.values());
};

export const createOrder = (order: Omit<Order, 'createdAt' | 'updatedAt'>): Order => {
  const newOrder: Order = {
    ...order,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  orders.set(newOrder.orderId, newOrder);
  return newOrder;
};

export const updateOrder = (orderId: string, updates: Partial<Order>): Order | undefined => {
  const order = orders.get(orderId);
  if (!order) return undefined;
  
  const updatedOrder = {
    ...order,
    ...updates,
    updatedAt: Date.now(),
  };
  orders.set(orderId, updatedOrder);
  return updatedOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): Order | undefined => {
  return updateOrder(orderId, { status });
};

export const getDeliveryAgent = (agentId: string): DeliveryAgent | undefined => {
  return deliveryAgents.get(agentId);
};

export const updateAgentLocation = (
  agentId: string, 
  lat: number, 
  lng: number
): DeliveryAgent | undefined => {
  let agent = deliveryAgents.get(agentId);
  
  if (!agent) {
    // Create new agent if doesn't exist
    agent = {
      id: agentId,
      name: `Agent ${agentId}`,
      phone: '',
      locationHistory: [],
    };
  }
  
  const newLocation = { lat, lng, timestamp: Date.now() };
  agent.currentLocation = newLocation;
  agent.locationHistory.push(newLocation);
  
  // Keep only last 50 locations
  if (agent.locationHistory.length > 50) {
    agent.locationHistory = agent.locationHistory.slice(-50);
  }
  
  deliveryAgents.set(agentId, agent);
  return agent;
};

export const getAgentForOrder = (orderId: string): DeliveryAgent | undefined => {
  // In real app, this would query based on order assignment
  // For demo, return first agent for in_transit orders
  const order = orders.get(orderId);
  if (order?.status === 'in_transit' || order?.status === 'picked_up') {
    return Array.from(deliveryAgents.values())[0];
  }
  return undefined;
};

// Generate a demo order ID for testing
export const generateDemoOrderId = (): string => {
  const existingIds = Array.from(orders.keys());
  if (existingIds.length > 0) {
    return existingIds[0];
  }
  return 'ORD-001';
};
