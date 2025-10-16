import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/lib/actions/order-actions";
import { requireAdmin } from "@/lib/auth-helpers";
import { OrdersTable } from "./orders-table";

export default async function OrdersPage() {
  // Server-side auth check
  await requireAdmin();

  // Fetch orders
  const orders = await getOrders();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion des commandes</h1>
          <p className="text-muted-foreground mt-2">
            Liste de toutes les commandes groupées
          </p>
        </div>
        <Link href="/admin/orders/new">
          <Button>Créer une commande</Button>
        </Link>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
