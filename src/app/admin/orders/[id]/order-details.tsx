"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteOrder, updateOrderStatus } from "@/lib/actions/order-actions";
import { OrderStatus, OrderType, WishStatus } from "@/lib/generated/prisma";

interface OrderDetailsProps {
  order: {
    id: string;
    type: OrderType;
    status: OrderStatus;
    title: string;
    description: string | null;
    targetDate: Date | null;
    orderPlacedAt: Date | null;
    deliveryExpectedAt: Date | null;
    deliveredAt: Date | null;
    customsFees: number | null;
    shippingCost: number | null;
    createdAt: Date;
    updatedAt: Date;
    wishes: Array<{
      id: string;
      productName: string;
      productUrl: string | null;
      quantity: number;
      estimatedPrice: number | null;
      validatedPrice: number | null;
      status: WishStatus;
      memberComments: string | null;
      adminComments: string | null;
      createdAt: Date;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
    orderItems: Array<{
      id: string;
      productName: string;
      productUrl: string | null;
      quantity: number;
      unitPrice: number;
      allocatedCustomsFee: number | null;
      allocatedShipping: number | null;
      totalPrice: number;
    }>;
    _count: {
      wishes: number;
      orderItems: number;
      notifications: number;
    };
  };
}

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

const getWishStatusLabel = (status: WishStatus) => {
  switch (status) {
    case WishStatus.SUBMITTED:
      return "Soumis";
    case WishStatus.VALIDATED:
      return "Validé";
    case WishStatus.REJECTED:
      return "Refusé";
    case WishStatus.CONFIRMED:
      return "Confirmé";
    case WishStatus.CANCELLED:
      return "Annulé";
    default:
      return status;
  }
};

const getWishStatusVariant = (status: WishStatus) => {
  switch (status) {
    case WishStatus.SUBMITTED:
      return "secondary";
    case WishStatus.VALIDATED:
      return "default";
    case WishStatus.CONFIRMED:
      return "outline";
    case WishStatus.REJECTED:
    case WishStatus.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
};

export function OrderDetails({ order }: OrderDetailsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (status: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus({ id: order.id, status });
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOrder(order.id);
      // Redirect happens in the server action
    } catch (error) {
      console.error("Error deleting order:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{order.title}</h1>
            <Badge variant="outline">{getTypeLabel(order.type)}</Badge>
          </div>
          {order.description && (
            <p className="text-muted-foreground">{order.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/orders/${order.id}/edit`}>
            <Button variant="outline">Modifier</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>

      {/* Status update */}
      <Card>
        <CardHeader>
          <CardTitle>Statut de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={order.status}
              onValueChange={(value) =>
                handleStatusChange(value as OrderStatus)
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.PLANNING}>
                  {getStatusLabel(OrderStatus.PLANNING)}
                </SelectItem>
                <SelectItem value={OrderStatus.IN_PROGRESS}>
                  {getStatusLabel(OrderStatus.IN_PROGRESS)}
                </SelectItem>
                <SelectItem value={OrderStatus.IN_DELIVERY}>
                  {getStatusLabel(OrderStatus.IN_DELIVERY)}
                </SelectItem>
                <SelectItem value={OrderStatus.COMPLETED}>
                  {getStatusLabel(OrderStatus.COMPLETED)}
                </SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>
                  {getStatusLabel(OrderStatus.CANCELLED)}
                </SelectItem>
              </SelectContent>
            </Select>
            {isUpdating && (
              <span className="text-sm text-muted-foreground">
                Mise à jour...
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la commande</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Date cible
            </p>
            <p className="text-sm">
              {order.targetDate
                ? new Date(order.targetDate).toLocaleDateString("fr-CA")
                : "Non définie"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Commande passée le
            </p>
            <p className="text-sm">
              {order.orderPlacedAt
                ? new Date(order.orderPlacedAt).toLocaleDateString("fr-CA")
                : "Non passée"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Livraison prévue
            </p>
            <p className="text-sm">
              {order.deliveryExpectedAt
                ? new Date(order.deliveryExpectedAt).toLocaleDateString("fr-CA")
                : "Non définie"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Livrée le
            </p>
            <p className="text-sm">
              {order.deliveredAt
                ? new Date(order.deliveredAt).toLocaleDateString("fr-CA")
                : "Non livrée"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Frais de douane
            </p>
            <p className="text-sm">
              {order.customsFees != null
                ? `${order.customsFees.toFixed(2)} $`
                : "0.00 $"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Frais d'expédition
            </p>
            <p className="text-sm">
              {order.shippingCost != null
                ? `${order.shippingCost.toFixed(2)} $`
                : "0.00 $"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wishes */}
      <Card>
        <CardHeader>
          <CardTitle>Souhaits des membres ({order._count.wishes})</CardTitle>
        </CardHeader>
        <CardContent>
          {order.wishes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun souhait soumis pour cette commande
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Prix estimé</TableHead>
                  <TableHead>Prix validé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.wishes.map((wish) => (
                  <TableRow key={wish.id}>
                    <TableCell className="font-medium">
                      {wish.user.name}
                    </TableCell>
                    <TableCell>
                      {wish.productUrl ? (
                        <a
                          href={wish.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {wish.productName}
                        </a>
                      ) : (
                        wish.productName
                      )}
                    </TableCell>
                    <TableCell>{wish.quantity}</TableCell>
                    <TableCell>
                      {wish.estimatedPrice
                        ? `${wish.estimatedPrice.toFixed(2)} $`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {wish.validatedPrice
                        ? `${wish.validatedPrice.toFixed(2)} $`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getWishStatusVariant(wish.status)}>
                        {getWishStatusLabel(wish.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Articles commandés ({order._count.orderItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {order.orderItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun article dans cette commande
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Douane</TableHead>
                  <TableHead>Expédition</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.productUrl ? (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.productName}
                        </a>
                      ) : (
                        item.productName
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice.toFixed(2)} $</TableCell>
                    <TableCell>
                      {item.allocatedCustomsFee?.toFixed(2) || "0.00"} $
                    </TableCell>
                    <TableCell>
                      {item.allocatedShipping?.toFixed(2) || "0.00"} $
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.totalPrice.toFixed(2)} $
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
