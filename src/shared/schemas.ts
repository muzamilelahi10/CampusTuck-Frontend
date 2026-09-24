import { z } from 'zod';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  FULFILMENT_TYPES,
  INVENTORY_REASONS,
} from './constants';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z
    .string()
    .trim()
    .min(10)
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  savedDeliveryDetails: z
    .object({
      building: z.string().trim().optional(),
      room: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    })
    .optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
  displayOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  category: z.string().min(1, 'Category ID is required'),
  price: z.coerce.number().int().positive('Price must be a positive number in paisa'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  imageUrls: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const adjustStockSchema = z.object({
  quantityChange: z.coerce.number().int().refine((n) => n !== 0, 'Quantity change cannot be 0'),
  reason: z.enum(['admin_adjustment', 'restock']),
  note: z.string().trim().max(200).optional(),
});

export const updateCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be 0 or more'),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().min(1),
    })
  ),
});

export const checkoutSchema = z
  .object({
    fulfilmentType: z.enum(FULFILMENT_TYPES),
    pickupPoint: z.string().trim().optional(),
    building: z.string().trim().optional(),
    room: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .min(10, 'Valid phone number is required')
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
    deliveryInstructions: z.string().trim().max(500).optional(),
    idempotencyKey: z.string().trim().min(8, 'Idempotency key must be at least 8 characters').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fulfilmentType === 'pickup' && (!data.pickupPoint || data.pickupPoint.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pickupPoint'],
        message: 'Pickup point is required for campus pickup orders',
      });
    }

    if (data.fulfilmentType === 'delivery') {
      if (!data.building || data.building.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['building'],
          message: 'Campus building is required for delivery',
        });
      }
      if (!data.room || data.room.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['room'],
          message: 'Room / Office / Location detail is required for delivery',
        });
      }
    }
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(300).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
  note: z.string().trim().max(300).optional(),
});

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  department: z.string().trim().optional(),
});
