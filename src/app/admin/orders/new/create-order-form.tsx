"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrder } from "@/lib/actions/order-actions";
import { OrderType } from "@/lib/generated/prisma";

export function CreateOrderForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await createOrder({
        type: formData.get("type") as OrderType,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        targetDate: formData.get("targetDate")
          ? new Date(formData.get("targetDate") as string)
          : undefined,
        customsFees: formData.get("customsFees")
          ? Number.parseFloat(formData.get("customsFees") as string)
          : undefined,
        shippingCost: formData.get("shippingCost")
          ? Number.parseFloat(formData.get("shippingCost") as string)
          : undefined,
      });

      // Redirect happens in the server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle commande</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Type de commande *</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderType.MONTHLY}>Mensuelle</SelectItem>
                <SelectItem value={OrderType.PRIVATE_SALE}>
                  Vente privée
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Ex: Commande Philibert - Janvier 2025"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Description optionnelle de la commande"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Date cible</Label>
            <Input id="targetDate" name="targetDate" type="date" />
            <p className="text-sm text-muted-foreground">
              Date limite pour soumettre les souhaits
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customsFees">Frais de douane ($)</Label>
              <Input
                id="customsFees"
                name="customsFees"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCost">Frais d'expédition ($)</Label>
              <Input
                id="shippingCost"
                name="shippingCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer la commande"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
