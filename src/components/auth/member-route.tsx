"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@/lib/generated/prisma";

interface MemberRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side component to protect member-only content
 * Note: This is a UI-only protection. Server-side protection is handled by middleware.
 */
export function MemberRoute({ children, fallback }: MemberRouteProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch current user role
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/login");
          return;
        }

        if (data.user.role !== UserRole.MEMBER) {
          router.push("/dashboard");
          return;
        }

        setIsMember(true);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (isMember === null) {
    return fallback || <div>Chargement...</div>;
  }

  if (!isMember) {
    return null;
  }

  return <>{children}</>;
}
