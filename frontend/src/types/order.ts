export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'delivered';

export interface GarmentSpecification {
  id: string;
  fieldName: string;
  value: string;
}

export interface OrderItem {
  id: string;
  garmentType: string;
  quantity: number;
  price: number;
  specifications: GarmentSpecification[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ScanLocation {
  latitude: number;
  longitude: number;
}

export interface ScanDetail {
  _id: string;
  orderId: string;
  location: ScanLocation;
  status: OrderStatus;
  scannedAt: string;
}

export interface Order {
  success?: boolean;
  orderId: string;
  merchantName?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items?: OrderItem[];
  status?: OrderStatus;
  createdAt?: number;
  updatedAt?: number;
  pickupLocation?: GeoLocation;
  deliveryLocation?: GeoLocation;
  estimatedDelivery?: string;
  notes?: string;
  audioNoteUrl?: string;
}

export interface OrderResult {
  success: boolean;
  message: string
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  currentLocation?: GeoLocation;
  locationHistory: GeoLocation[];
}

export interface ScanningUpdate {
  orderId: string;
  location: object;
  status: string;
  scannedAt: string
}

export interface ScanResult {
  success: boolean;
  message: string;
  scanDetails: ScanDetail[] | null;
}

export interface OrderUpdate {
  orderId: string;
  status: string
}

export type UserRole = 'merchant' | 'delivery' | 'customer';
