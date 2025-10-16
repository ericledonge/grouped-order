"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";

/**
 * Get the current authenticated session
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Get the current authenticated user with role
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if the current user is a member
 */
export async function isMember(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === UserRole.MEMBER;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require admin role - redirect to dashboard if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Require member role - redirect to dashboard if not member
 */
export async function requireMember() {
  const user = await requireAuth();
  if (user.role !== UserRole.MEMBER) {
    redirect("/dashboard");
  }
  return user;
}
