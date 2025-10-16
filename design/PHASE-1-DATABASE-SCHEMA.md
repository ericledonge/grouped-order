# Phase 1 : Fondations - Schéma de base de données

**Statut** : ✅ Complétée
**Date** : 2025-10-15
**Migration** : `20251016013006_add_roles_orders_wishes_notifications`

## Vue d'ensemble

Cette phase établit les fondations de l'application en créant le modèle de domaine complet dans la base de données PostgreSQL via Prisma. Elle introduit les concepts métier essentiels : rôles utilisateurs, commandes groupées, souhaits des membres, articles de commande et notifications.

## Modifications apportées

### 1. Extension du modèle User

**Fichier** : [prisma/schema.prisma](../prisma/schema.prisma)

#### Ajouts
- **Enum `UserRole`** : `ADMIN` | `MEMBER`
- **Champ `role`** : Type `UserRole`, valeur par défaut `MEMBER`
- **Relations** :
  - `wishes` : Liste des souhaits soumis par l'utilisateur
  - `notifications` : Liste des notifications reçues

```prisma
enum UserRole {
  ADMIN
  MEMBER
}

model User {
  id            String         @id
  name          String
  email         String
  emailVerified Boolean        @default(false)
  image         String?
  role          UserRole       @default(MEMBER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @default(now()) @updatedAt
  sessions      Session[]
  accounts      Account[]
  wishes        Wish[]
  notifications Notification[]

  @@unique([email])
  @@map("user")
}
```

#### Justification
- Permet de distinguer les administrateurs des membres
- Facilite la mise en place de permissions différenciées
- Valeur par défaut `MEMBER` pour sécurité (principe du moindre privilège)

---

### 2. Modèle Order (Commande groupée)

**Concept métier** : Représente une commande groupée organisée par un administrateur.

#### Enums associés

```prisma
enum OrderType {
  MONTHLY        // Commande mensuelle récurrente
  PRIVATE_SALE   // Commande liée à une vente privée
}

enum OrderStatus {
  PLANNING      // En cours de planification (collecte des souhaits)
  IN_PROGRESS   // Commande passée chez Philibert
  IN_DELIVERY   // En transit / en douane
  COMPLETED     // Livrée et distribuée
  CANCELLED     // Annulée
}
```

#### Structure du modèle

```prisma
model Order {
  id                 String        @id @default(cuid())
  type               OrderType
  status             OrderStatus   @default(PLANNING)
  title              String
  description        String?
  targetDate         DateTime?
  orderPlacedAt      DateTime?
  deliveryExpectedAt DateTime?
  deliveredAt        DateTime?
  customsFees        Float?        @default(0)
  shippingCost       Float?        @default(0)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  wishes             Wish[]
  orderItems         OrderItem[]
  notifications      Notification[]

  @@map("order")
}
```

#### Champs clés
- **type** : Distinction entre commandes mensuelles et ventes privées
- **status** : Cycle de vie de la commande
- **targetDate** : Date limite pour soumission des souhaits
- **orderPlacedAt** : Date de passage de la commande chez Philibert
- **deliveryExpectedAt** : Date de livraison estimée
- **deliveredAt** : Date de livraison effective
- **customsFees** : Frais de douane totaux pour cette commande
- **shippingCost** : Coût total d'expédition

#### Relations
- `wishes[]` : Souhaits soumis par les membres
- `orderItems[]` : Articles finaux dans la commande (après validation)
- `notifications[]` : Notifications liées à cette commande

---

### 3. Modèle Wish (Souhait membre)

**Concept métier** : Représente la demande d'un membre pour un jeu spécifique dans une commande groupée.

#### Enum associé

```prisma
enum WishStatus {
  SUBMITTED   // Soumis par le membre
  VALIDATED   // Validé par l'admin avec prix
  REJECTED    // Refusé par l'admin
  CONFIRMED   // Confirmé par le membre (engagement d'achat)
  CANCELLED   // Annulé par le membre
}
```

#### Structure du modèle

```prisma
model Wish {
  id              String      @id @default(cuid())
  userId          String
  orderId         String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  order           Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productName     String
  productUrl      String?
  quantity        Int         @default(1)
  estimatedPrice  Float?
  validatedPrice  Float?
  memberComments  String?
  adminComments   String?
  status          WishStatus  @default(SUBMITTED)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@map("wish")
}
```

#### Champs clés
- **productName** : Nom du jeu souhaité
- **productUrl** : Lien vers le produit (généralement sur Philibert)
- **quantity** : Quantité désirée
- **estimatedPrice** : Prix estimé par le membre (optionnel)
- **validatedPrice** : Prix réel fixé par l'admin
- **memberComments** : Commentaires du membre (ex: édition préférée)
- **adminComments** : Notes de l'admin (ex: indisponibilité, alternative)
- **status** : Cycle de vie du souhait

#### Flux de statut
1. `SUBMITTED` : Membre soumet le souhait
2. `VALIDATED` : Admin valide et fixe le prix
3. `CONFIRMED` : Membre confirme son engagement d'achat
4. Alternatives : `REJECTED` (refus admin) ou `CANCELLED` (retrait membre)

---

### 4. Modèle OrderItem (Article de commande)

**Concept métier** : Représente un article effectivement commandé chez Philibert (après validation et confirmation).

#### Structure du modèle

```prisma
model OrderItem {
  id                  String   @id @default(cuid())
  orderId             String
  order               Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productName         String
  productUrl          String?
  quantity            Int      @default(1)
  unitPrice           Float
  allocatedCustomsFee Float?   @default(0)
  allocatedShipping   Float?   @default(0)
  totalPrice          Float
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@map("order_item")
}
```

#### Champs clés
- **unitPrice** : Prix unitaire du jeu
- **allocatedCustomsFee** : Quote-part des frais de douane pour cet article
- **allocatedShipping** : Quote-part des frais d'expédition
- **totalPrice** : Prix total (unitPrice × quantity + frais alloués)

#### Relation avec Wish
Un `OrderItem` est créé à partir d'un `Wish` au statut `CONFIRMED`. La séparation permet :
- De conserver l'historique des souhaits (même refusés/annulés)
- De gérer les articles finaux avec calculs de frais précis
- D'optimiser les requêtes (liste d'articles vs. liste de souhaits)

---

### 5. Modèle Notification

**Concept métier** : Système de notifications pour communiquer avec les membres et administrateurs.

#### Enum associé

```prisma
enum NotificationType {
  WISH_VALIDATED      // Souhait validé par l'admin
  WISH_REJECTED       // Souhait refusé par l'admin
  PRICE_PUBLISHED     // Prix publié, attente confirmation membre
  PAYMENT_REQUIRED    // Paiement requis
  ORDER_PLACED        // Commande passée chez Philibert
  ORDER_DELIVERED     // Commande livrée
  READY_FOR_PICKUP    // Jeux disponibles au point de collecte
  GENERAL             // Notification générale
}
```

#### Structure du modèle

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  orderId   String?
  order     Order?           @relation(fields: [orderId], references: [id], onDelete: SetNull)
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@map("notification")
}
```

#### Champs clés
- **type** : Type de notification (impact l'affichage et les actions possibles)
- **title** : Titre court
- **message** : Contenu détaillé
- **orderId** : Optionnel, lien vers la commande concernée
- **isRead** : Indicateur de lecture (pour badge de notifications non lues)

#### Stratégie de suppression
- `onDelete: Cascade` pour User : Si un utilisateur est supprimé, ses notifications le sont aussi
- `onDelete: SetNull` pour Order : Si une commande est supprimée, les notifications conservent leur contenu mais perdent le lien

---

## Migration de base de données

### Commande exécutée

```bash
npx prisma migrate dev --name add_roles_orders_wishes_notifications
```

### Résultat

```
✔ Migration créée : prisma/migrations/20251016013006_add_roles_orders_wishes_notifications/
✔ Base de données synchronisée
✔ Client Prisma généré dans src/lib/generated/prisma/
```

### Fichier de migration

Le fichier SQL complet se trouve dans :
```
prisma/migrations/20251016013006_add_roles_orders_wishes_notifications/migration.sql
```

---

## Validation et tests

### Validation du code

```bash
npm run validate
```

**Résultat** : ✅ Aucune erreur
- Biome check : ✓
- Biome format : ✓
- TypeScript compilation : ✓

### Génération du client Prisma

Le client Prisma TypeScript a été automatiquement généré avec tous les types :
- `User`, `UserRole`
- `Order`, `OrderType`, `OrderStatus`
- `Wish`, `WishStatus`
- `OrderItem`
- `Notification`, `NotificationType`

**Emplacement** : `src/lib/generated/prisma/`

---

## Diagramme ERD (Entity Relationship Diagram)

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │──┐
│ role        │  │
│ email       │  │
│ name        │  │
└─────────────┘  │
                 │
                 │ 1:N
                 │
                 ↓
            ┌─────────────┐
            │    Wish     │
            ├─────────────┤
            │ id          │
            │ userId      │
            │ orderId     │───────┐
            │ status      │       │
            │ productName │       │
            │ validatedPrice│     │
            └─────────────┘       │
                                  │ N:1
                                  ↓
                           ┌──────────────┐
                           │    Order     │
                           ├──────────────┤
                           │ id           │
                           │ type         │
                           │ status       │
                           │ customsFees  │
                           └──────────────┘
                                  │
                                  │ 1:N
                                  ↓
                           ┌──────────────┐
                           │  OrderItem   │
                           ├──────────────┤
                           │ id           │
                           │ orderId      │
                           │ unitPrice    │
                           │ totalPrice   │
                           └──────────────┘

User ──1:N── Notification ──N:1(optional)── Order
```

---

## Points d'attention et bonnes pratiques

### 1. Cascade vs SetNull
- **Cascade** : Utilisé pour Wish, OrderItem, Notification quand lié à User/Order
- **SetNull** : Utilisé pour Notification.order (préserve l'historique)

### 2. Prix et calculs
- Tous les prix sont en `Float` (à considérer `Decimal` pour production si besoin de précision monétaire)
- `totalPrice` dans OrderItem est calculé mais stocké (dénormalisation pour performance)

### 3. Statuts et workflows
- Les enums définissent clairement les états possibles
- Transitions de statut à implémenter dans la logique métier (Phase 3)

### 4. Index futurs à considérer
Pour optimisation en production :
- `@@index([userId])` sur Wish, Notification
- `@@index([orderId])` sur Wish, OrderItem, Notification
- `@@index([status])` sur Order, Wish
- `@@index([isRead, userId])` sur Notification

---

## Prochaines étapes

La Phase 1 pose les fondations. Les phases suivantes construiront sur cette base :

**Phase 2** : Gestion des rôles et permissions
- Middleware d'authentification
- Helpers `isAdmin()`, `isMember()`
- Protection des routes

**Phase 3** : CRUD des commandes (Administrateur)
- API REST ou Server Actions
- Validation des souhaits
- Gestion du cycle de vie

**Phase 4** : Participation des membres
- Soumission de souhaits
- Confirmation d'engagement
- Suivi de commandes

**Phase 5** : Notifications et communication
- Création automatique de notifications
- Centre de notifications
- Indicateurs visuels (badge)

---

## Ressources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [PostgreSQL with Prisma](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

---

**Créé le** : 2025-10-15
**Dernière mise à jour** : 2025-10-15
**Auteur** : Claude Code Assistant
