"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { PrismaClient } from "@/lib/generated/prisma";
import {
  type CreateOrderInput,
  createOrderSchema,
  type UpdateOrderInput,
  type UpdateOrderStatusInput,
  updateOrderSchema,
  updateOrderStatusSchema,
} from "@/lib/validations/order";

const prisma = new PrismaClient();

/**
 * Create a new order (Admin only)
 */
export async function createOrder(input: CreateOrderInput) {
  // Verify admin permission
  await requireAdmin();

  // Validate input
  const validated = createOrderSchema.parse(input);

  // Create order
  const order = await prisma.order.create({
    data: {
      type: validated.type,
      title: validated.title,
      description: validated.description,
      targetDate: validated.targetDate,
      customsFees: validated.customsFees,
      shippingCost: validated.shippingCost,
    },
  });

  // Revalidate the orders list
  revalidatePath("/admin/orders");

  // Redirect to the new order details page
  redirect(`/admin/orders/${order.id}`);
}

/**
 * Get all orders (Admin only)
 */
export async function getOrders() {
  // Verify admin permission
  await requireAdmin();

  const orders = await prisma.order.findMany({
    include: {
      _count: {
        select: {
          wishes: true,
          orderItems: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

/**
 * Get order by ID with full details (Admin only)
 */
export async function getOrderById(orderId: string) {
  // Verify admin permission
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      wishes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      orderItems: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          wishes: true,
          orderItems: true,
          notifications: true,
        },
      },
    },
  });

  return order;
}

/**
 * Update order (Admin only)
 */
export async function updateOrder(input: UpdateOrderInput) {
  // Verify admin permission
  await requireAdmin();

  // Validate input
  const validated = updateOrderSchema.parse(input);

  const { id, ...data } = validated;

  // Update order
  const order = await prisma.order.update({
    where: { id },
    data,
  });

  // Revalidate paths
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return order;
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  // Verify admin permission
  await requireAdmin();

  // Validate input
  const validated = updateOrderStatusSchema.parse(input);

  // Update order status
  const order = await prisma.order.update({
    where: { id: validated.id },
    data: { status: validated.status },
  });

  // Revalidate paths
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${validated.id}`);

  return order;
}

/**
 * Delete order (Admin only)
 */
export async function deleteOrder(orderId: string) {
  // Verify admin permission
  await requireAdmin();

  // Delete order (cascade will delete related wishes, orderItems, notifications)
  await prisma.order.delete({
    where: { id: orderId },
  });

  // Revalidate the orders list
  revalidatePath("/admin/orders");

  // Redirect to orders list
  redirect("/admin/orders");
}
