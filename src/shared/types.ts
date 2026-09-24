import {
  Role,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  FulfilmentType,
  InventoryMovementReason,
} from './constants';

export interface ISavedDeliveryDetails {
  building?: string;
  room?: string;
  notes?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  savedDeliveryDetails?: ISavedDeliveryDetails;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  displayOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string | ICategory;
  price: number; // In paisas (e.g. 15000 = Rs. 150)
  stock: number;
  lowStockThreshold: number;
  imageUrls: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

export interface ICart {
  _id: string;
  customer?: string;
  guestSessionId?: string;
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  updatedAt: string;
}

export interface IOrderItemSnapshot {
  productId: string;
  name: string;
  unitPrice: number; // In paisas
  quantity: number;
  subtotal: number; // In paisas
  imageUrl?: string;
}

export interface IFulfilmentDetails {
  type: FulfilmentType;
  pickupPoint?: string;
  building?: string;
  room?: string;
  phone: string;
  deliveryInstructions?: string;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string | { _id: string; name: string; role: Role };
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: string | IUser;
  items: IOrderItemSnapshot[];
  subtotal: number; // In paisas
  deliveryFee: number; // In paisas
  total: number; // In paisas
  fulfilmentType: FulfilmentType;
  fulfilmentDetails: IFulfilmentDetails;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  statusHistory: IOrderStatusHistory[];
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryMovement {
  _id: string;
  product: string | IProduct;
  quantityChange: number; // e.g. -2 for order deduction, +10 for restock
  reason: InventoryMovementReason;
  relatedOrder?: string | IOrder;
  admin?: string | IUser;
  previousStock: number;
  newStock: number;
  timestamp: string;
}

export interface IDashboardMetrics {
  pendingOrdersCount: number;
  completedOrdersCount: number;
  lowStockCount: number;
  totalRevenuePaisa: number;
  dailySales: {
    date: string;
    totalRevenuePaisa: number;
    ordersCount: number;
  }[];
  topSellingProducts: {
    productId: string;
    name: string;
    totalQuantity: number;
    totalRevenuePaisa: number;
  }[];
  ordersByStatus: {
    status: OrderStatus;
    count: number;
  }[];
}
