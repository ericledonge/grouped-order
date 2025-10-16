"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/lib/actions/auth-actions";
import type { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";

type Session = typeof auth.$Infer.Session;

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

export default function DashboardClientPage({ session }: { session: Session }) {
  const router = useRouter();
  const user = session.user as ExtendedUser;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            Se déconnecter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenue !</CardTitle>
            <CardDescription>Vous êtes connecté avec succès</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name}
                    className="h-16 w-16 rounded-full"
                    width={64}
                    height={64}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    <Badge
                      variant={
                        user.role === UserRole.ADMIN ? "default" : "secondary"
                      }
                    >
                      {user.role === UserRole.ADMIN
                        ? "Administrateur"
                        : "Membre"}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-neutral-100 dark:bg-neutral-800 p-4">
              <h3 className="mb-2 font-medium">Informations de session</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    ID utilisateur:
                  </dt>
                  <dd className="font-mono text-xs">{user.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Rôle:
                  </dt>
                  <dd className="font-medium">
                    {user.role === UserRole.ADMIN ? "Administrateur" : "Membre"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Email vérifié:
                  </dt>
                  <dd>
                    {user.emailVerified ? (
                      <span className="text-green-600">✓ Oui</span>
                    ) : (
                      <span className="text-orange-600">✗ Non</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes groupées</CardTitle>
            <CardDescription>
              Gérez vos commandes de jeux de société
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-500 dark:text-neutral-400">
              Les fonctionnalités de commandes groupées seront disponibles
              prochainement...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
