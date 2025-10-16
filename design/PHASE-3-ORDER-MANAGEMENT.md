# Phase 3 : Gestion des commandes (Administrateur)

**Statut** : ✅ Complétée
**Date** : 2025-10-15
**Dépend de** : Phase 1 (Database Schema), Phase 2 (Roles & Permissions)

## Vue d'ensemble

Cette phase implémente le système complet de gestion des commandes groupées pour les administrateurs. Elle permet la création, la visualisation, la modification et la suppression de commandes, ainsi que la gestion de leur cycle de vie et des souhaits soumis par les membres.

## Objectifs

1. Créer les schémas de validation pour les opérations sur les commandes
2. Implémenter les Server Actions CRUD pour les commandes
3. Développer l'interface de liste des commandes
4. Créer le formulaire de création de commande
5. Implémenter la page de détails et gestion de commande
6. Permettre la mise à jour du statut des commandes
7. Intégrer la gestion des commandes dans la navigation

## Implémentations

### 1. Schémas de validation Zod

**Fichier** : [src/lib/validations/order.ts](../src/lib/validations/order.ts)

Trois schémas de validation pour assurer l'intégrité des données :

#### createOrderSchema
Validation pour la création d'une nouvelle commande :

```typescript
{
  type: OrderType (MONTHLY | PRIVATE_SALE)
  title: string (3-100 caractères)
  description?: string
  targetDate?: Date
  customsFees?: number (≥ 0)
  shippingCost?: number (≥ 0)
}
```

#### updateOrderSchema
Validation pour la mise à jour d'une commande existante :

```typescript
{
  id: string
  type?: OrderType
  status?: OrderStatus
  title?: string (3-100 caractères)
  description?: string | null
  targetDate?: Date | null
  orderPlacedAt?: Date | null
  deliveryExpectedAt?: Date | null
  deliveredAt?: Date | null
  customsFees?: number (≥ 0) | null
  shippingCost?: number (≥ 0) | null
}
```

#### updateOrderStatusSchema
Validation simplifiée pour mise à jour du statut uniquement :

```typescript
{
  id: string
  status: OrderStatus
}
```

**Types TypeScript générés** :
- `CreateOrderInput`
- `UpdateOrderInput`
- `UpdateOrderStatusInput`

---

### 2. Server Actions pour les commandes

**Fichier** : [src/lib/actions/order-actions.ts](../src/lib/actions/order-actions.ts)

Toutes les actions sont protégées par `requireAdmin()` et utilisent `revalidatePath()` pour rafraîchir le cache Next.js.

#### createOrder(input: CreateOrderInput)
- Valide les données d'entrée avec Zod
- Crée la commande en base de données
- Revalide `/admin/orders`
- Redirige vers `/admin/orders/[id]`

```typescript
const order = await createOrder({
  type: OrderType.MONTHLY,
  title: "Commande Janvier 2025",
  targetDate: new Date("2025-01-31"),
});
// Redirects automatically to /admin/orders/[id]
```

#### getOrders()
- Récupère toutes les commandes avec compteurs
- Inclut `_count` pour wishes et orderItems
- Triées par date de création (DESC)

```typescript
const orders = await getOrders();
// Returns array with _count.wishes and _count.orderItems
```

#### getOrderById(orderId: string)
- Récupère une commande spécifique avec tous ses détails
- Inclut wishes avec informations utilisateur
- Inclut orderItems
- Retourne `null` si non trouvée

```typescript
const order = await getOrderById("cm123...");
if (!order) notFound();
```

#### updateOrder(input: UpdateOrderInput)
- Valide les données avec Zod
- Met à jour la commande
- Revalide `/admin/orders` et `/admin/orders/[id]`

```typescript
await updateOrder({
  id: "cm123...",
  customsFees: 150.00,
  deliveredAt: new Date(),
});
```

#### updateOrderStatus(input: UpdateOrderStatusInput)
- Met à jour uniquement le statut
- Revalide les paths concernés
- Utilisé pour les transitions de cycle de vie

```typescript
await updateOrderStatus({
  id: "cm123...",
  status: OrderStatus.IN_PROGRESS,
});
```

#### deleteOrder(orderId: string)
- Supprime la commande (cascade vers wishes, orderItems, notifications)
- Revalide `/admin/orders`
- Redirige vers `/admin/orders`

```typescript
await deleteOrder("cm123...");
// Redirects to /admin/orders
```

---

### 3. Page de liste des commandes

#### Server Component
**Fichier** : [src/app/admin/orders/page.tsx](../src/app/admin/orders/page.tsx)

- Vérifie le rôle admin avec `requireAdmin()`
- Récupère toutes les commandes
- Affiche le titre et un bouton "Créer une commande"
- Rend le composant `OrdersTable`

#### Client Component - OrdersTable
**Fichier** : [src/app/admin/orders/orders-table.tsx](../src/app/admin/orders/orders-table.tsx)

Tableau interactif affichant :

| Colonne | Description |
|---------|-------------|
| Titre | Nom de la commande |
| Type | Badge "Mensuelle" ou "Vente privée" |
| Statut | Badge coloré selon le statut |
| Souhaits | Nombre de souhaits soumis |
| Articles | Nombre d'articles dans la commande |
| Date cible | Date limite pour soumettre les souhaits |
| Créée le | Date de création |
| Actions | Bouton "Voir" → détails |

**Fonctions utilitaires** :
- `getStatusLabel()` : Traduction FR des statuts
- `getStatusBadgeVariant()` : Couleur du badge selon statut
- `getTypeLabel()` : Traduction FR des types

**Variantes de badge par statut** :
- `PLANNING` → `secondary` (gris)
- `IN_PROGRESS` → `default` (bleu)
- `IN_DELIVERY` → `outline` (contour)
- `COMPLETED` → `outline` (contour, potentiellement vert)
- `CANCELLED` → `destructive` (rouge)

---

### 4. Formulaire de création de commande

#### Server Component
**Fichier** : [src/app/admin/orders/new/page.tsx](../src/app/admin/orders/new/page.tsx)

- Vérifie le rôle admin
- Affiche le formulaire de création

#### Client Component - CreateOrderForm
**Fichier** : [src/app/admin/orders/new/create-order-form.tsx](../src/app/admin/orders/new/create-order-form.tsx)

Formulaire complet avec :

**Champs** :
- **Type** (Select, requis) : MONTHLY ou PRIVATE_SALE
- **Titre** (Input text, requis) : 3-100 caractères
- **Description** (Textarea, optionnel) : Détails supplémentaires
- **Date cible** (Input date, optionnel) : Date limite pour souhaits
- **Frais de douane** (Input number, optionnel) : Montant en $
- **Frais d'expédition** (Input number, optionnel) : Montant en $

**Fonctionnalités** :
- Validation côté client (HTML5 + React)
- Validation côté serveur (Zod dans Server Action)
- Gestion d'erreur avec affichage de messages
- État de chargement pendant la soumission
- Bouton "Annuler" pour retour arrière
- Redirection automatique après création

**Gestion d'état** :
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

### 5. Page de détails de commande

#### Server Component
**Fichier** : [src/app/admin/orders/[id]/page.tsx](../src/app/admin/orders/[id]/page.tsx)

- Route dynamique avec paramètre `id`
- Vérifie le rôle admin
- Récupère la commande ou retourne `notFound()`
- Passe les données au composant client

#### Client Component - OrderDetails
**Fichier** : [src/app/admin/orders/[id]/order-details.tsx](../src/app/admin/orders/[id]/order-details.tsx)

Interface complète de gestion avec plusieurs sections :

##### En-tête
- Titre de la commande avec badge de type
- Bouton "Modifier" (lien vers `/admin/orders/[id]/edit` - à implémenter)
- Bouton "Supprimer" avec confirmation

##### Mise à jour du statut
- Select pour changer le statut de la commande
- Appel à `updateOrderStatus()` en temps réel
- Indicateur visuel pendant la mise à jour
- `router.refresh()` pour rafraîchir les données

**Statuts disponibles** :
1. Planification
2. En cours
3. En livraison
4. Complétée
5. Annulée

##### Informations de la commande
Grille 2 colonnes affichant :
- Date cible
- Commande passée le
- Livraison prévue
- Livrée le
- Frais de douane
- Frais d'expédition

##### Souhaits des membres
Tableau des souhaits soumis :
- Membre (nom)
- Produit (avec lien si URL fournie)
- Quantité
- Prix estimé (par membre)
- Prix validé (par admin)
- Statut (badge coloré)
- Actions (bouton "Gérer" - à implémenter)

**Message si vide** : "Aucun souhait soumis pour cette commande"

##### Articles commandés
Tableau des articles finaux :
- Produit (avec lien si URL fournie)
- Quantité
- Prix unitaire
- Frais de douane alloués
- Frais d'expédition alloués
- Prix total

**Message si vide** : "Aucun article dans cette commande"

**Fonctions utilitaires** :
- `getWishStatusLabel()` : Traduction FR des statuts de souhaits
- `getWishStatusVariant()` : Couleur du badge selon statut

---

### 6. Composants UI shadcn ajoutés

Cette phase a nécessité l'ajout de :

```bash
npx shadcn@latest add select
```

**Fichier créé** :
- [src/components/ui/select.tsx](../src/components/ui/select.tsx)

**Composants réutilisés** (déjà présents) :
- Table, Badge, Button, Card, Input, Label

---

### 7. Navigation mise à jour

**Fichier** : [src/components/navigation.tsx](../src/components/navigation.tsx)

Ajout de deux liens admin visibles uniquement pour les administrateurs :

```tsx
{session?.user?.role === "ADMIN" && (
  <>
    <Link href="/admin/orders">Commandes</Link>
    <Link href="/admin/members">Membres</Link>
  </>
)}
```

**Structure de navigation pour admins** :
1. Tableau de bord (tous)
2. Commandes (admin uniquement)
3. Membres (admin uniquement)
4. Déconnexion (tous)

---

## Flux utilisateur

### Création d'une commande

```
/admin/orders
  ↓ Clic "Créer une commande"
/admin/orders/new
  ↓ Remplir formulaire
  ↓ Soumettre
createOrder() Server Action
  ↓ Validation Zod
  ↓ Insertion DB
  ↓ Redirect
/admin/orders/[id]
```

### Gestion du cycle de vie

```
Statut: PLANNING (collecte des souhaits)
  ↓ Admin change statut → IN_PROGRESS
Statut: IN_PROGRESS (commande passée chez Philibert)
  ↓ Admin change statut → IN_DELIVERY
Statut: IN_DELIVERY (en transit/douane)
  ↓ Admin change statut → COMPLETED
Statut: COMPLETED (livrée et distribuée)
```

**Alternative** : PLANNING → CANCELLED

### Suppression d'une commande

```
/admin/orders/[id]
  ↓ Clic "Supprimer"
  ↓ Confirmation (confirm dialog)
deleteOrder() Server Action
  ↓ Cascade delete (wishes, orderItems, notifications)
  ↓ Revalidate
  ↓ Redirect
/admin/orders
```

---

## Sécurité et validation

### Protection multi-niveaux

1. **Middleware** : Bloque `/admin/*` si non authentifié ou non admin
2. **Server Component** : `requireAdmin()` dans chaque page
3. **Server Action** : `requireAdmin()` dans chaque action
4. **Validation** : Zod pour chaque input

### Validation Zod

Tous les inputs sont validés avec messages d'erreur en français :
- Types corrects (enum, string, number, date)
- Contraintes min/max
- Coercion automatique pour dates et nombres

**Exemple** :
```typescript
customsFees: z.coerce
  .number()
  .min(0, "Les frais de douane ne peuvent pas être négatifs")
  .optional()
```

---

## Revalidation et cache

Utilisation de `revalidatePath()` pour rafraîchir le cache Next.js :

```typescript
// Après création
revalidatePath("/admin/orders");

// Après mise à jour
revalidatePath("/admin/orders");
revalidatePath(`/admin/orders/${id}`);

// Après suppression
revalidatePath("/admin/orders");
```

Combiné avec `router.refresh()` côté client pour forcer le rafraîchissement immédiat.

---

## Points d'amélioration identifiés

### À implémenter (Phases futures)

1. **Page d'édition** : `/admin/orders/[id]/edit` (référencée mais non implémentée)
2. **Gestion des souhaits** : Validation/refus de souhaits individuels
3. **Création d'OrderItems** : Depuis les souhaits confirmés
4. **Calcul automatique** : Distribution des frais de douane et expédition
5. **Notifications** : Envoi automatique lors des changements de statut
6. **Filtres et recherche** : Dans la liste des commandes
7. **Pagination** : Pour les grandes listes
8. **Export** : PDF ou CSV des commandes

### Limitations actuelles

1. **Pas de validation des transitions de statut** : Permet de passer de COMPLETED à PLANNING
2. **Pas de confirmation avant changement de statut** : Pourrait être problématique
3. **Pas de journalisation** : Aucun audit trail des modifications
4. **Bouton "Gérer" des souhaits** : Non fonctionnel (placeholder)
5. **Aucune validation des dates** : targetDate peut être dans le passé

---

## Tests de validation

### Validation du code

```bash
npm run validate
```

**Résultat** : ✅ Aucune erreur
- Biome check : ✓
- Biome format : ✓
- TypeScript compilation : ✓

### Tests manuels recommandés

1. **Création de commande** :
   - Soumettre avec champs vides → Erreurs de validation
   - Soumettre avec titre trop court → Erreur
   - Soumettre avec frais négatifs → Erreur
   - Soumettre formulaire valide → Succès + redirection

2. **Liste des commandes** :
   - Vérifier affichage correct des badges
   - Vérifier compteurs (wishes, orderItems)
   - Cliquer sur "Voir" → Redirection vers détails

3. **Détails de commande** :
   - Changer le statut → Mise à jour + refresh visuel
   - Cliquer "Supprimer" → Confirmation + suppression
   - Vérifier affichage des souhaits si présents
   - Vérifier affichage des orderItems si présents

4. **Navigation** :
   - Vérifier présence du lien "Commandes" si admin
   - Vérifier absence du lien si non admin

---

## Métriques de performance

### Requêtes Prisma optimisées

- Utilisation de `select` pour limiter les champs retournés
- Utilisation de `include` avec `_count` pour compteurs efficaces
- Pas de requêtes N+1 (wishes et orderItems chargés en une fois)

### Revalidation ciblée

- Seuls les paths concernés sont revalidés
- Évite la revalidation globale inutile

---

## Diagramme de flux - Gestion de commande

```
┌─────────────────────────────────────────────────────┐
│  Admin visite /admin/orders                         │
└─────────────────────────────────────────────────────┘
                      │
                      ↓
         ┌────────────────────────┐
         │  requireAdmin()        │
         └────────────────────────┘
                      │
                      ↓
         ┌────────────────────────┐
         │  getOrders()           │
         │  (Server Action)       │
         └────────────────────────┘
                      │
                      ↓
         ┌────────────────────────┐
         │  OrdersTable           │
         │  (Client Component)    │
         └────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ↓                       ↓
    Voir détails            Créer nouvelle
          │                       │
          ↓                       ↓
  /admin/orders/[id]    /admin/orders/new
          │                       │
          ↓                       ↓
    OrderDetails          CreateOrderForm
          │                       │
   ┌──────┴──────┐                │
   │             │                ↓
   ↓             ↓         createOrder()
Modifier     Supprimer           │
Statut       Commande            │
   │             │               ↓
   ↓             ↓         Redirect vers
updateOrderStatus()      /admin/orders/[id]
deleteOrder()
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Validation complète
npm run validate

# Vérifier les types
npx tsc --noEmit

# Formater le code
npm run format

# Ouvrir Prisma Studio (gérer les données)
npx prisma studio

# Générer le client Prisma après changements
npx prisma generate
```

---

## Prochaines étapes

La Phase 3 fournit la base pour gérer les commandes. Les phases suivantes s'appuieront sur cette infrastructure :

**Phase 4** : Participation des membres
- Soumission de souhaits dans les commandes
- Confirmation d'engagement après validation admin
- Visualisation de l'état de mes souhaits

**Phase 5** : Notifications et communication
- Notification auto quand souhait validé
- Notification auto quand prix publié
- Notification auto quand paiement requis
- Notification auto quand jeux disponibles

**Phase 6** : Gestion avancée des souhaits
- Validation/refus de souhaits individuels
- Conversion de souhaits confirmés en orderItems
- Calcul automatique des frais alloués

---

**Créé le** : 2025-10-15
**Dernière mise à jour** : 2025-10-15
**Auteur** : Claude Code Assistant
