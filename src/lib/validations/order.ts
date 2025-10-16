import { z } from "zod";
import { OrderStatus, OrderType } from "@/lib/generated/prisma";

/**
 * Schema for creating a new order
 */
export const createOrderSchema = z.object({
  type: z.nativeEnum(OrderType, {
    message: "Type de commande invalide",
  }),
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z.string().optional(),
  targetDate: z.coerce.date().optional(),
  customsFees: z.coerce
    .number()
    .min(0, "Les frais de douane ne peuvent pas être négatifs")
    .optional(),
  shippingCost: z.coerce
    .number()
    .min(0, "Les frais d'expédition ne peuvent pas être négatifs")
    .optional(),
});

/**
 * Schema for updating an existing order
 */
export const updateOrderSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(OrderType).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères")
    .optional(),
  description: z.string().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
  orderPlacedAt: z.coerce.date().optional().nullable(),
  deliveryExpectedAt: z.coerce.date().optional().nullable(),
  deliveredAt: z.coerce.date().optional().nullable(),
  customsFees: z.coerce
    .number()
    .min(0, "Les frais de douane ne peuvent pas être négatifs")
    .optional()
    .nullable(),
  shippingCost: z.coerce
    .number()
    .min(0, "Les frais d'expédition ne peuvent pas être négatifs")
    .optional()
    .nullable(),
});

/**
 * Schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(OrderStatus, {
    message: "Statut de commande invalide",
  }),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
