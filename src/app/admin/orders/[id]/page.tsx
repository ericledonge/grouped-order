import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order-actions";
import { requireAdmin } from "@/lib/auth-helpers";
import { OrderDetails } from "./order-details";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  // Server-side auth check
  await requireAdmin();

  const { id } = await params;

  // Fetch order
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <OrderDetails order={order} />
    </div>
  );
}
