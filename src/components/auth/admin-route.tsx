"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@/lib/generated/prisma";

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side component to protect admin-only content
 * Note: This is a UI-only protection. Server-side protection is handled by middleware.
 */
export function AdminRoute({ children, fallback }: AdminRouteProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch current user role
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/login");
          return;
        }

        if (data.user.role !== UserRole.ADMIN) {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (isAdmin === null) {
    return fallback || <div>Chargement...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
