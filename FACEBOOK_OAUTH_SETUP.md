# Configuration Facebook OAuth - Guide Complet

Ce guide vous explique comment configurer l'authentification Facebook pour votre application.

## Étape 1 : Créer une application Facebook

1. Allez sur **[Facebook Developers](https://developers.facebook.com/)**
2. Cliquez sur **"Mes applications"** (en haut à droite)
3. Cliquez sur **"Créer une application"**
4. Sélectionnez le type **"Consommateur"** (pour permettre aux utilisateurs de se connecter)
5. Cliquez sur **"Suivant"**

## Étape 2 : Configurer les informations de base

1. Remplissez les informations :
   - **Nom de l'application** : Votre nom d'application (ex: "Grouped Order")
   - **Email de contact** : Votre email
   - **Catégorie d'application** : Choisissez une catégorie appropriée
2. Cliquez sur **"Créer une application"**
3. Complétez la vérification de sécurité si demandé

## Étape 3 : Ajouter le produit "Connexion Facebook"

### Option A : Interface récente (2024+) - Via "Cas d'usage"

1. Dans le tableau de bord de votre application, cherchez **"Cas d'usage"** dans le menu de gauche
2. Vous devriez voir une liste de cas d'usage disponibles
3. Trouvez **"Authentifier et demander des données provenant des utilisateurs avec la Connexion Facebook"**
   - Ou en anglais : **"Authenticate and request data from users with Facebook Login"**
4. Cliquez sur **"Personnaliser"** ou **"Customize"** (bouton bleu)
5. Le produit est maintenant ajouté ! Passez à l'étape 4

### Option B : Interface classique - Via "Ajouter des produits"

1. Dans le tableau de bord, cherchez dans le menu de gauche :
   - **"Ajouter des produits"**
   - Ou **"Add Products"**
   - Ou une section avec un **+** (plus)
2. Vous verrez une liste de produits disponibles (cartes/tuiles)
3. Trouvez la carte **"Connexion Facebook"** ou **"Facebook Login"**
   - Elle a généralement une icône bleue avec un bouclier ou un cadenas
4. Cliquez sur **"Configurer"** ou **"Set Up"** sur cette carte
5. Facebook va ajouter le produit à votre application

### Option C : Si vous ne voyez aucune de ces options

Votre application est peut-être déjà configurée différemment. Essayez :
1. Cherchez **"Tableau de bord"** ou **"Dashboard"** dans le menu de gauche
2. Vous devriez voir des cartes pour différentes fonctionnalités
3. Cherchez une carte ou un bouton pour ajouter des fonctionnalités

## Étape 4 : Configurer les URL de redirection OAuth

C'est ici que vous configurez l'URL de callback !

### Méthode A : Via les "Cas d'usage" (Interface récente 2024+)

1. Dans le tableau de bord de votre application, cherchez **"Cas d'usage"** dans le menu de gauche
2. Trouvez la section **"Authentifier et demander des données provenant des utilisateurs avec la Connexion Facebook"**
3. Cliquez sur **"Personnaliser"** ou **"Configurer"**
4. Faites défiler jusqu'à trouver **"Paramètres"**
5. Cherchez **"URI de redirection OAuth valides"** ou **"Valid OAuth Redirect URIs"**
6. Ajoutez cette URL :
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
7. Cliquez sur **"Enregistrer les modifications"**

### Méthode B : Via le menu "Produits" (Interface classique)

1. Dans le menu de gauche, cliquez sur **"Produits"** ou **"Products"**
2. Trouvez **"Connexion Facebook"** ou **"Facebook Login"** et cliquez sur **"Paramètres"** ou **"Settings"**
3. Vous verrez une page avec plusieurs champs de configuration
4. Trouvez le champ **"URI de redirection OAuth valides"** (Valid OAuth Redirect URIs)
5. Ajoutez cette URL :
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
6. Cliquez sur **"Enregistrer les modifications"** en bas de la page

### Méthode C : Accès direct par URL

Si vous ne trouvez toujours pas, essayez d'accéder directement :
1. Une fois dans votre application, regardez l'URL du navigateur
2. Elle devrait ressembler à : `https://developers.facebook.com/apps/VOTRE_APP_ID/...`
3. Changez l'URL pour : `https://developers.facebook.com/apps/VOTRE_APP_ID/fb-login/settings/`
4. Appuyez sur Entrée
5. Vous devriez voir directement la page des paramètres de connexion Facebook

### Pour la production :

Quand vous déploierez votre application, ajoutez également :
```
https://votre-domaine.com/api/auth/callback/facebook
```

**Important** : Vous pouvez avoir plusieurs URLs de redirection (locale + production)

## Étape 5 : Récupérer les credentials

1. Dans le menu de gauche, allez dans **"Paramètres" > "Paramètres de base"**
2. Vous verrez :
   - **Identifiant de l'application (App ID)** : C'est votre `FACEBOOK_CLIENT_ID`
   - **Clé secrète de l'application (App Secret)** : Cliquez sur **"Afficher"** pour voir la clé secrète (c'est votre `FACEBOOK_CLIENT_SECRET`)

3. Copiez ces deux valeurs

## Étape 6 : Configurer les variables d'environnement

1. Ouvrez le fichier `.env` à la racine de votre projet
2. Remplacez les valeurs vides par vos credentials :

```bash
FACEBOOK_CLIENT_ID="votre_app_id_ici"
FACEBOOK_CLIENT_SECRET="votre_app_secret_ici"
```

**Exemple** :
```bash
FACEBOOK_CLIENT_ID="1234567890123456"
FACEBOOK_CLIENT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

## Étape 7 : Configurer les paramètres de l'application

### Domaines de l'application

1. Allez dans **"Paramètres" > "Paramètres de base"**
2. Trouvez **"Domaines de l'application"**
3. Ajoutez :
   - Pour le développement : `localhost`
   - Pour la production : `votre-domaine.com`

### URL de la politique de confidentialité et conditions d'utilisation

Facebook **EXIGE** ces URLs pour publier votre application :
1. Dans **"Paramètres" > "Paramètres de base"**
2. Ajoutez :
   - **URL de la politique de confidentialité** : `https://votre-domaine.com/privacy`
   - **URL des conditions d'utilisation** : `https://votre-domaine.com/terms`

(Pour le développement, vous pouvez utiliser des URLs temporaires)

## Étape 8 : Activer le mode développement/production

### Mode développement (pour tester localement) :

L'application est en mode développement par défaut. Seuls les utilisateurs ajoutés comme testeurs peuvent se connecter.

**Ajouter des testeurs** :
1. Allez dans **"Rôles" > "Testeurs"**
2. Cliquez sur **"Ajouter des testeurs"**
3. Ajoutez les comptes Facebook qui pourront tester l'authentification

### Mode production (pour publier l'application) :

Une fois prêt pour la production :
1. Allez dans **"Paramètres" > "Paramètres de base"**
2. Faites défiler jusqu'à **"Statut de l'application"**
3. Activez le bouton pour passer en mode **"Production"**
4. Facebook peut vous demander de compléter une vérification d'entreprise

## Étape 9 : Tester l'authentification

1. Redémarrez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrez votre navigateur à `http://localhost:3000/login`

3. Cliquez sur **"Continuer avec Facebook"**

4. Vous devriez être redirigé vers Facebook pour autoriser l'application

5. Après autorisation, vous serez redirigé vers `/dashboard`

## Dépannage

### Erreur : "URL Not Allowed"
- Vérifiez que `http://localhost:3000/api/auth/callback/facebook` est bien dans les **URI de redirection OAuth valides**
- Vérifiez que `localhost` est dans les **Domaines de l'application**

### Erreur : "App Not Setup"
- Assurez-vous que le produit **"Connexion Facebook"** est bien ajouté à votre application
- Vérifiez que les credentials sont corrects dans le fichier `.env`

### Erreur : "This App is in Development Mode"
- C'est normal ! Ajoutez votre compte Facebook comme testeur dans **"Rôles" > "Testeurs"**

### Les credentials ne sont pas chargés
- Redémarrez le serveur après avoir modifié `.env`
- Vérifiez qu'il n'y a pas d'espaces dans les valeurs
- Vérifiez que les guillemets sont bien présents

## Permissions Facebook demandées

Par défaut, Better Auth demande ces permissions :
- `email` : Pour récupérer l'email de l'utilisateur
- `public_profile` : Pour récupérer le nom et la photo de profil

Ces permissions sont suffisantes pour l'authentification de base.

## Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS votre fichier `.env` dans Git (il est déjà dans `.gitignore`)
- Ne partagez JAMAIS votre `FACEBOOK_CLIENT_SECRET`
- Utilisez des variables d'environnement différentes pour production et développement
- Pour la production, utilisez les secrets de votre plateforme de déploiement (Vercel, etc.)

## Ressources officielles

- [Documentation Facebook Login](https://developers.facebook.com/docs/facebook-login/)
- [Better Auth - Facebook Provider](https://www.better-auth.com/docs/authentication/facebook)
- [Guide de révision d'application Facebook](https://developers.facebook.com/docs/app-review)
