export const ROLES = ['customer', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const FULFILMENT_TYPES = ['pickup', 'delivery'] as const;
export type FulfilmentType = (typeof FULFILMENT_TYPES)[number];

export const INVENTORY_REASONS = [
  'order_created',
  'order_cancelled',
  'admin_adjustment',
  'restock',
] as const;
export type InventoryMovementReason = (typeof INVENTORY_REASONS)[number];

export const DEFAULT_CAMPUS_NAME = 'COMSATS University Islamabad';

export const DEFAULT_PICKUP_POINTS = [
  'Main Student Tuck Shop (Central Cafeteria Ground Floor)',
  'Academic Block 2 (CS Block) Canteen Kiosk',
  'Student Activity Center (SAC) Tuck Corner',
  'Junaid Zaidi Central Library Lawn Stall',
  'Hostel Gate Tuck Corner (Liaquat / Jinnah Hall)',
  'Faculty Block 1 Cafe Kiosk',
] as const;

export const DEFAULT_CAMPUS_BUILDINGS = [
  'Academic Block 1 (EE Department)',
  'Academic Block 2 (CS & IT Department)',
  'Academic Block 3 (Management Sciences & Humanities)',
  'Faculty Block 1 (EE & Math)',
  'Faculty Block 2 (CS & Physics)',
  'Junaid Zaidi Central Library',
  'Student Activity Center (SAC)',
  'Liaquat Hall (Boys Hostel)',
  'Jinnah Hall (Boys Hostel)',
  'Johar Hall (Boys Hostel)',
  'Fatima Jinnah Hall (Girls Hostel)',
  'Administrative Block / Secretariat',
  'Sports Complex & Gymnasium',
] as const;

export const DEFAULT_DELIVERY_FEE_PAISA = 5000; // Rs. 50 in paisa
export const PICKUP_FEE_PAISA = 0;

/**
 * Valid order status transitions state machine.
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Validates if an order transition is allowed.
 * Optionally verifies fulfilment-specific states (e.g. ready_for_pickup is for pickup, out_for_delivery is for delivery).
 */
export function isAllowedTransition(
  current: OrderStatus,
  next: OrderStatus,
  fulfilmentType?: FulfilmentType
): { allowed: boolean; reason?: string } {
  if (current === next) {
    return { allowed: false, reason: `Order is already in status '${current}'` };
  }

  const allowedNext = ALLOWED_ORDER_TRANSITIONS[current] || [];
  if (!allowedNext.includes(next)) {
    return {
      allowed: false,
      reason: `Cannot transition order from '${current}' to '${next}'. Allowed next states: ${allowedNext.join(', ') || 'None (Terminal state)'}`,
    };
  }

  if (fulfilmentType === 'pickup' && next === 'out_for_delivery') {
    return {
      allowed: false,
      reason: `Pickup orders cannot transition to 'out_for_delivery'. Expected 'ready_for_pickup'.`,
    };
  }

  if (fulfilmentType === 'delivery' && next === 'ready_for_pickup') {
    return {
      allowed: false,
      reason: `Campus delivery orders cannot transition to 'ready_for_pickup'. Expected 'out_for_delivery'.`,
    };
  }

  return { allowed: true };
}

/**
 * Format paisa integer to formatted PKR string (e.g. 15000 paisa -> "Rs. 150")
 */
export function formatPKR(paisa: number): string {
  const rupees = (paisa / 100).toLocaleString('en-PK', {
    minimumFractionDigits: paisa % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `Rs. ${rupees}`;
}

export function paisaToRupees(paisa: number): number {
  return Number((paisa / 100).toFixed(2));
}

export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}
