"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { PrismaClient, type UserRole } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

/**
 * Get all members (Admin only)
 */
export async function getMembers() {
  // Verify admin permission
  await requireAdmin();

  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          wishes: true,
          notifications: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return members;
}

/**
 * Get member by ID (Admin only)
 */
export async function getMemberById(memberId: string) {
  // Verify admin permission
  await requireAdmin();

  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      wishes: {
        include: {
          order: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          wishes: true,
          notifications: true,
        },
      },
    },
  });

  return member;
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(userId: string, role: UserRole) {
  // Verify admin permission
  await requireAdmin();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return updatedUser;
}
