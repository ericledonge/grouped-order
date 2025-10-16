"use client";

import { useSession } from "@/lib/auth-client";
import { UserRole } from "@/lib/generated/prisma";

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseAuthReturn {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  refetch: () => void;
}

/**
 * Hook to access current user session and role
 * Uses Better Auth's official useSession hook
 */
export function useAuth(): UseAuthReturn {
  const { data: session, isPending, refetch } = useSession();

  const user = session?.user as ExtendedUser | null;

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.ADMIN,
    isMember: user?.role === UserRole.MEMBER,
    refetch,
  };
}
