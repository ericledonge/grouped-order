import { requireAdmin } from "@/lib/auth-helpers";
import { CreateOrderForm } from "./create-order-form";

export default async function NewOrderPage() {
  // Server-side auth check
  await requireAdmin();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Créer une commande</h1>
        <p className="text-muted-foreground mt-2">
          Créer une nouvelle commande groupée
        </p>
      </div>

      <CreateOrderForm />
    </div>
  );
}
