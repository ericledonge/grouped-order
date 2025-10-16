# Configuration des administrateurs

Ce guide explique comment configurer les comptes administrateurs de l'application.

## Méthode automatique (Recommandée)

### Configuration des emails admin

1. **Ajoutez vos emails dans `.env` ou `.env.local`** :

```bash
ADMIN_EMAILS="votre.email@facebook.com,autre.admin@gmail.com"
```

- Séparez les emails par des virgules
- Les espaces sont automatiquement supprimés
- La casse n'a pas d'importance (comparaison insensible à la casse)

2. **Connectez-vous normalement**

Lorsque vous ou votre co-administrateur vous connectez pour la première fois (via Facebook ou email/password), le système détectera automatiquement que votre email est dans la liste `ADMIN_EMAILS` et assignera le rôle `ADMIN`.

### Exemple complet `.env.local`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/grouped-order"

# Facebook OAuth
FACEBOOK_CLIENT_ID="123456789"
FACEBOOK_CLIENT_SECRET="abc123def456"

# Admins (VOS emails)
ADMIN_EMAILS="jean.dupont@facebook.com,marie.martin@gmail.com"
```

## Connexion Facebook

### Prérequis

1. Créer une application Facebook sur [developers.facebook.com](https://developers.facebook.com)
2. Activer "Facebook Login" dans votre app
3. Configurer les URLs de redirection autorisées :
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://votre-domaine.com/api/auth/callback/facebook`

### Configuration

Dans votre `.env.local` :

```bash
FACEBOOK_CLIENT_ID="votre_app_id"
FACEBOOK_CLIENT_SECRET="votre_app_secret"
```

### Utilisation

1. Allez sur `/login`
2. Cliquez sur "Se connecter avec Facebook"
3. Autorisez l'application
4. Si votre email Facebook est dans `ADMIN_EMAILS`, vous serez automatiquement admin !

## Méthode manuelle (Script de seed)

Si vous préférez créer un compte admin avec email/password classique :

### 1. Configurez le script

Dans `.env.local` :

```bash
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="VotreMotDePasseSécurisé"
ADMIN_NAME="Votre Nom"
```

### 2. Installez les dépendances nécessaires

```bash
npm install -D tsx bcryptjs @types/bcryptjs
```

### 3. Exécutez le script

```bash
npm run db:seed
```

### 4. Connectez-vous

- Email : celui que vous avez configuré
- Mot de passe : celui que vous avez configuré

## Vérification

Pour vérifier qu'un utilisateur est admin :

### Option 1 : Prisma Studio

```bash
npx prisma studio
```

Ouvrez la table `user` et vérifiez que le champ `role` est `ADMIN`.

### Option 2 : Interface

1. Connectez-vous
2. Si vous voyez les liens "Commandes" et "Membres" dans la navigation → vous êtes admin ✅
3. Si vous ne les voyez pas → vous êtes un membre normal

## Promouvoir un utilisateur existant en admin

Si un utilisateur s'est déjà inscrit mais n'est pas admin :

### Via Prisma Studio

```bash
npx prisma studio
```

1. Ouvrez la table `user`
2. Trouvez l'utilisateur par email
3. Changez `role` de `MEMBER` à `ADMIN`
4. Sauvegardez

### Via script SQL

```sql
UPDATE "user"
SET role = 'ADMIN'
WHERE email = 'email@example.com';
```

## Révoquer les droits admin

Même processus, mais changez `ADMIN` → `MEMBER`.

## Sécurité

⚠️ **Important** :

1. **Ne committez jamais `.env` ou `.env.local`** dans Git
2. **Utilisez des mots de passe forts** pour les comptes email/password
3. **Limitez le nombre d'admins** (principe du moindre privilège)
4. **Vérifiez régulièrement** la liste des admins
5. **Retirez immédiatement** les droits des anciens admins

## FAQ

### Combien d'admins puis-je avoir ?

Autant que nécessaire ! Ajoutez simplement les emails dans `ADMIN_EMAILS` séparés par des virgules.

### Puis-je mélanger Facebook et email/password ?

Oui ! Un admin peut utiliser Facebook, l'autre email/password. Le système détecte automatiquement l'email.

### Que se passe-t-il si je change `ADMIN_EMAILS` après que les utilisateurs se soient inscrits ?

Les utilisateurs déjà créés **ne seront pas affectés**. Le hook ne s'exécute que lors de la création du compte.

Pour mettre à jour les rôles d'utilisateurs existants :
1. Utilisez Prisma Studio
2. Ou créez un script de migration

### Un admin peut-il retirer ses propres droits ?

Techniquement oui via Prisma Studio, mais l'interface web ne le permet pas (protection).

## Dépannage

### "Je me suis connecté avec Facebook mais je ne suis pas admin"

1. Vérifiez que votre email Facebook est dans `ADMIN_EMAILS`
2. Vérifiez qu'il n'y a pas d'espaces ou de typos
3. Déconnectez-vous et reconnectez-vous (videz le cache)
4. Vérifiez dans Prisma Studio que le rôle est bien `ADMIN`

### "Le hook ne s'exécute pas"

1. Vérifiez que Better Auth est bien configuré
2. Regardez les logs du serveur (console)
3. Vous devriez voir : `✨ Auto-assigned ADMIN role to: email@example.com`

### "Je ne vois toujours pas les menus admin"

1. Déconnectez-vous complètement
2. Reconnectez-vous
3. Videz le cache du navigateur
4. Vérifiez que `session.user.role === "ADMIN"` dans les outils de développement

## Support

Pour toute question, consultez la documentation Better Auth : https://www.better-auth.com
