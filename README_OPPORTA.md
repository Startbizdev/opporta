# ⚡ OPPORTA

Feed d'opportunités business en temps réel.

## Stack Tech

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js + Email Magic Links
- **Email**: Resend
- **Hosting**: Vercel

## Setup Local

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la base de données

Créer une base de données PostgreSQL sur [Neon](https://neon.tech) et ajouter l'URL dans `.env.local`:

```bash
DATABASE_URL=postgresql://...
```

### 3. Migrations Prisma

```bash
npx prisma migrate dev --name init
```

### 4. Variables d'environnement

Remplir `.env.local` avec:
- `NEXTAUTH_SECRET`: Générer avec `openssl rand -base64 32`
- `RESEND_API_KEY`: Clé API depuis [Resend](https://resend.com)

### 5. Lancer le serveur

```bash
npm run dev
```

Accéder à `http://localhost:3000`

## Features MVP

✅ Feed scoré - Posts triés par pertinence
✅ Création de posts - REQUEST / OFFER avec budget
✅ Système de réponses - Coûte 1 crédit par réponse
✅ Chat simple - Conversations texte
✅ Recherche et filtres - Catégorie, budget, type
✅ Authentification - Email magic links
✅ Crédits - 3 crédits gratuits au signup

## Workflow Utilisateur

1. **Connexion** → Login avec email → Vérifier l'email
2. **Voir le feed** → Page principale avec 20 posts scorés
3. **Répondre** → Cliquer "Répondre" → Payer 1 crédit → Conversation démarre
4. **Chat** → Discuter avec le posteur via messages texte
5. **Créer post** → Titre + description + catégorie + budget → Publié immédiatement

## API Routes

`GET /api/posts` - Lister (pagination 20)
`POST /api/posts` - Créer post
`POST /api/posts/[id]/replies` - Répondre (coûte 1 crédit)
`GET /api/conversations` - Mes conversations
`GET/POST /api/messages` - Chat
`GET /api/credits` - Solde de crédits

## Scoring

```
score = 
  (budget_défini ? 2 : 0) +
  récence * 1 +
  complétude * 2 +
  engagement * 1
```

## Développement Futur

- Paiement Stripe
- Notifications avancées
- Matching IA
- Images/fichiers
- Avis utilisateurs
- Analytics
