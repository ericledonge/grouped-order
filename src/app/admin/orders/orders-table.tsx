"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatus, OrderType } from "@/lib/generated/prisma";

interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  title: string;
  description: string | null;
  targetDate: Date | null;
  createdAt: Date;
  _count: {
    wishes: number;
    orderItems: number;
  };
}

interface OrdersTableProps {
  orders: Order[];
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PLANNING:
      return "secondary";
    case OrderStatus.IN_PROGRESS:
      return "default";
    case OrderStatus.IN_DELIVERY:
      return "outline";
    case OrderStatus.COMPLETED:
      return "outline";
    case OrderStatus.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PLANNING:
      return "Planification";
    case OrderStatus.IN_PROGRESS:
      return "En cours";
    case OrderStatus.IN_DELIVERY:
      return "En livraison";
    case OrderStatus.COMPLETED:
      return "Complétée";
    case OrderStatus.CANCELLED:
      return "Annulée";
    default:
      return status;
  }
};

const getTypeLabel = (type: OrderType) => {
  switch (type) {
    case OrderType.MONTHLY:
      return "Mensuelle";
    case OrderType.PRIVATE_SALE:
      return "Vente privée";
    default:
      return type;
  }
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Souhaits</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Date cible</TableHead>
            <TableHead>Créée le</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                Aucune commande trouvée
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeLabel(order.type)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>{order._count.wishes}</TableCell>
                <TableCell>{order._count.orderItems}</TableCell>
                <TableCell>
                  {order.targetDate
                    ? new Date(order.targetDate).toLocaleDateString("fr-CA")
                    : "-"}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("fr-CA")}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
