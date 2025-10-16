# Phase 2 : Gestion des rôles et permissions

**Statut** : ✅ Complétée
**Date** : 2025-10-15
**Dépend de** : Phase 1 - Database Schema

## Vue d'ensemble

Cette phase implémente le système de contrôle d'accès basé sur les rôles (RBAC) en utilisant les rôles définis dans la Phase 1. Elle met en place les mécanismes de protection côté serveur et côté client, ainsi qu'une interface d'administration pour gérer les membres.

## Objectifs

1. Créer des utilitaires serveur pour vérifier les rôles et permissions
2. Protéger les routes avec un middleware Next.js
3. Fournir des composants React pour la protection côté client
4. Créer un hook réutilisable pour accéder au contexte d'authentification
5. Implémenter une interface d'administration pour gérer les membres

## Implémentations

### 1. Helpers de vérification de rôle (Server-side)

**Fichier** : [src/lib/auth-helpers.ts](../src/lib/auth-helpers.ts)

Fonctions serveur pour vérifier l'authentification et les rôles :

```typescript
// Récupérer la session courante
getSession() → Session | null

// Récupérer l'utilisateur courant
getCurrentUser() → User | null

// Vérifier si admin
isAdmin() → Promise<boolean>

// Vérifier si membre
isMember() → Promise<boolean>

// Exiger authentification (redirect si non authentifié)
requireAuth() → Promise<User>

// Exiger rôle admin (redirect si non admin)
requireAdmin() → Promise<User>

// Exiger rôle membre (redirect si non membre)
requireMember() → Promise<User>
```

**Usage dans une Server Component ou Server Action** :
```typescript
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminPage() {
  const user = await requireAdmin(); // Redirige automatiquement si non admin
  // ...
}
```

---

### 2. Middleware de protection des routes

**Fichier** : [src/middleware.ts](../src/middleware.ts)

Protection automatique des routes selon leur préfixe :

| Route | Protection | Comportement |
|-------|-----------|--------------|
| `/admin/*` | Admin uniquement | Redirect vers `/login` si non authentifié, vers `/dashboard` si authentifié mais non admin |
| `/dashboard` | Authentification requise | Redirect vers `/login` si non authentifié |
| `/orders/*` | Authentification requise | Redirect vers `/login` si non authentifié |
| Autres | Public | Accès libre |

**Fonctionnement** :
- Exécuté avant chaque requête (sauf assets statiques et API auth)
- Vérifie la session via Better Auth
- Redirige automatiquement selon le contexte
- Préserve l'URL de destination via query param `?redirect=`

**Configuration** :
```typescript
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
```

---

### 3. Extension de Better Auth pour le rôle utilisateur

**Fichier** : [src/lib/auth.ts](../src/lib/auth.ts)

Configuration de Better Auth pour inclure le champ `role` dans la session :

```typescript
export const auth = betterAuth({
  // ... autres configs
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.MEMBER,
        input: false, // Empêche les utilisateurs de définir ce champ directement
      },
    },
  },
});
```

**Implications** :
- Le champ `role` est maintenant accessible dans `session.user.role`
- Valeur par défaut : `MEMBER` pour tous les nouveaux comptes
- Protection : Les utilisateurs ne peuvent pas définir leur propre rôle lors de l'inscription
- Les admins peuvent modifier les rôles via l'API admin

---

### 4. Composants de protection côté client

#### AdminRoute

**Fichier** : [src/components/auth/admin-route.tsx](../src/components/auth/admin-route.tsx)

Composant pour protéger du contenu réservé aux admins :

```tsx
<AdminRoute fallback={<LoadingSpinner />}>
  <AdminOnlyContent />
</AdminRoute>
```

**Comportement** :
- Affiche un fallback pendant la vérification
- Redirige vers `/login` si non authentifié
- Redirige vers `/dashboard` si authentifié mais non admin
- Affiche le contenu si admin

**Note** : Protection UI uniquement. La protection serveur (middleware + helpers) reste essentielle.

#### MemberRoute

**Fichier** : [src/components/auth/member-route.tsx](../src/components/auth/member-route.tsx)

Similaire à `AdminRoute` mais pour le rôle `MEMBER`.

---

### 5. Hook useAuth (Client-side)

**Fichier** : [src/hooks/use-auth.ts](../src/hooks/use-auth.ts)

Hook React pour accéder au contexte d'authentification côté client :

```typescript
const { user, isLoading, isAuthenticated, isAdmin, isMember, refetch } = useAuth();
```

**Retour** :
- `user` : Objet utilisateur avec `id`, `email`, `name`, `role`, `image`
- `isLoading` : Boolean indiquant si la vérification est en cours
- `isAuthenticated` : Boolean indiquant si un utilisateur est connecté
- `isAdmin` : Boolean indiquant si l'utilisateur est admin
- `isMember` : Boolean indiquant si l'utilisateur est membre
- `refetch` : Fonction pour rafraîchir manuellement la session

**Usage dans un composant** :
```tsx
function MyComponent() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {isAdmin && <AdminPanel />}
      <RegularContent />
    </div>
  );
}
```

---

### 6. Actions serveur pour la gestion des membres

**Fichier** : [src/lib/actions/member-actions.ts](../src/lib/actions/member-actions.ts)

Server Actions pour gérer les membres (admin uniquement) :

```typescript
// Récupérer tous les membres
getMembers() → Promise<Member[]>

// Récupérer un membre par ID
getMemberById(memberId: string) → Promise<Member | null>

// Mettre à jour le rôle d'un utilisateur
updateUserRole(userId: string, role: UserRole) → Promise<User>
```

**Sécurité** :
- Chaque fonction commence par `await requireAdmin()`
- Retourne une erreur 403 si appelée par un non-admin
- Utilise Prisma pour interroger la base de données en toute sécurité

---

### 7. Interface d'administration des membres

#### Page admin

**Fichier** : [src/app/admin/members/page.tsx](../src/app/admin/members/page.tsx)

Server Component qui :
1. Vérifie le rôle admin côté serveur (`requireAdmin()`)
2. Récupère la liste des membres
3. Affiche le composant `MembersTable`

#### Tableau des membres

**Fichier** : [src/app/admin/members/members-table.tsx](../src/app/admin/members/members-table.tsx)

Client Component affichant un tableau avec :
- Nom du membre
- Email
- Rôle (badge coloré : Admin = bleu, Membre = gris)
- Statut de vérification email (badge vert/orange)
- Nombre de souhaits soumis
- Date d'inscription

**Composants UI utilisés** :
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` (shadcn/ui)
- `Badge` (shadcn/ui) pour les indicateurs visuels

---

### 8. Mise à jour de la navigation

**Fichier** : [src/components/navigation.tsx](../src/components/navigation.tsx)

Ajout d'un lien "Admin" dans la barre de navigation, visible uniquement pour les administrateurs :

```tsx
{session?.user?.role === "ADMIN" && (
  <Link href="/admin/members">Admin</Link>
)}
```

**Liens de navigation** :
- Tableau de bord (tous les utilisateurs authentifiés)
- Admin (administrateurs uniquement)
- Déconnexion (tous les utilisateurs authentifiés)

---

## Composants shadcn/ui ajoutés

Cette phase a nécessité l'ajout de composants UI :

```bash
npx shadcn@latest add table badge
```

**Fichiers créés** :
- [src/components/ui/table.tsx](../src/components/ui/table.tsx)
- [src/components/ui/badge.tsx](../src/components/ui/badge.tsx)

---

## Architecture de sécurité

### Défense en profondeur

La protection est implémentée à **trois niveaux** :

1. **Middleware** (Edge) : Première ligne de défense, bloque les requêtes non autorisées
2. **Server Components/Actions** : Vérification côté serveur avec `requireAdmin()` / `requireAuth()`
3. **Client Components** : Protection UI pour l'expérience utilisateur (non sécuritaire seule)

### Flux de protection

```
┌─────────────────────────────────────────────────────────────┐
│ Requête utilisateur : /admin/members                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
           ┌──────────────────────────────┐
           │   Middleware (Edge)          │
           │  - Vérifie session           │
           │  - Vérifie role === ADMIN    │
           │  - Redirect si non autorisé  │
           └──────────────────────────────┘
                          │
                          ↓ (si autorisé)
           ┌──────────────────────────────┐
           │   Server Component           │
           │  - await requireAdmin()      │
           │  - Fetch données             │
           └──────────────────────────────┘
                          │
                          ↓
           ┌──────────────────────────────┐
           │   Client Component           │
           │  - Affichage UI              │
           │  - useAuth() pour UX         │
           └──────────────────────────────┘
```

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

1. **Test d'accès non authentifié** :
   - Visiter `/admin/members` sans être connecté
   - Vérifier redirection vers `/login?redirect=/admin/members`

2. **Test d'accès membre (non admin)** :
   - Se connecter avec un compte MEMBER
   - Visiter `/admin/members`
   - Vérifier redirection vers `/dashboard`

3. **Test d'accès admin** :
   - Se connecter avec un compte ADMIN
   - Visiter `/admin/members`
   - Vérifier affichage du tableau des membres
   - Vérifier présence du lien "Admin" dans la navigation

4. **Test du hook useAuth** :
   - Utiliser dans un composant client
   - Vérifier que `isAdmin` reflète le rôle correctement
   - Vérifier que `user.role` est accessible

---

## Limitations et améliorations futures

### Limitations actuelles

1. **Pas de gestion fine des permissions** : Seulement ADMIN vs MEMBER
2. **Pas d'édition de rôle via UI** : Fonction `updateUserRole` créée mais pas encore d'interface
3. **Pas de journalisation** : Aucun audit log des changements de rôle
4. **Session côté client** : `useAuth` fait un fetch à chaque montage de composant (pourrait être optimisé avec un contexte global)

### Améliorations prévues

1. **Phase 2.1** : Ajouter interface pour changer le rôle d'un utilisateur
2. **Phase 2.2** : Implémenter un système de permissions granulaires (ex: `canManageOrders`, `canViewReports`)
3. **Phase 2.3** : Ajouter des sous-rôles (ex: `ADMIN_PRINCIPAL`, `ADMIN_LOGISTIQUE`)
4. **Phase 2.4** : Logger les changements de rôles dans une table d'audit

---

## Points clés pour les développeurs

### Bonnes pratiques

1. **Toujours protéger côté serveur** : Ne jamais se fier uniquement aux composants client
2. **Utiliser requireAdmin() dans les Server Actions** : Toujours commencer par vérifier les permissions
3. **Rediriger plutôt que afficher une erreur** : Meilleure UX avec `redirect()` de Next.js
4. **Tester avec différents rôles** : Créer des comptes de test pour ADMIN et MEMBER

### Pièges à éviter

1. **Ne pas oublier le middleware matcher** : Si vous ajoutez de nouvelles routes protégées, pensez au matcher
2. **Ne pas modifier `user.role` directement** : Utiliser `updateUserRole()` pour audit et validation
3. **Ne pas bypasser requireAdmin()** : Même si le middleware protège, ajouter la vérification serveur
4. **Ne pas exposer de données sensibles** : Toujours utiliser `select` dans Prisma pour limiter les champs retournés

---

## Commandes utiles

```bash
# Valider le code
npm run validate

# Lancer le serveur de dev
npm run dev

# Vérifier les types TypeScript
npx tsc --noEmit

# Formater le code
npm run format

# Linter
npm run lint

# Ouvrir Prisma Studio pour gérer les rôles manuellement
npx prisma studio
```

---

## Prochaines étapes

La Phase 2 pose les fondations pour le contrôle d'accès. Les phases suivantes s'appuieront sur ces mécanismes :

**Phase 3** : CRUD des commandes (Administrateur)
- Créer, lire, mettre à jour, supprimer des commandes
- Protégé par `requireAdmin()`

**Phase 4** : Participation des membres
- Soumettre des souhaits
- Confirmer des engagements
- Protégé par `requireAuth()` et `requireMember()`

**Phase 5** : Notifications et communication
- Système de notifications automatiques
- Utilisation de `user.role` pour router les notifications

---

**Créé le** : 2025-10-15
**Dernière mise à jour** : 2025-10-15
**Auteur** : Claude Code Assistant
