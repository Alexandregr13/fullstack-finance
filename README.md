# Conseils en Investissements Collaboratifs

Application fullstack permettant l'affichage et la rédaction de conseils en investissements collaboratifs.

## Stack Technique

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│                    React + Vite                             │
│                   Tests: Cypress                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                │
│                  Node.js + Express                          │
│              ORM: Sequelize + SQLite                        │
│           Auth: jws (JWT) + bcrypt                          │
│                   Tests: Jest                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DONNEES                           │
│           SQLite (dev) / PostgreSQL (prod)                  │
└─────────────────────────────────────────────────────────────┘
```

## Structure du Projet

```
fullstack-finance/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Configuration Express + Swagger
│   │   ├── server.js                 # Point d'entrée serveur
│   │   │
│   │   ├── models/                   # Modèles Sequelize
│   │   │   ├── database.js           # Connexion DB (mandatoryenv)
│   │   │   ├── users.js              # Utilisateurs
│   │   │   ├── advices.js            # Conseils + relations
│   │   │   ├── categories.js         # Catégories hiérarchiques
│   │   │   ├── comments.js           # Commentaires
│   │   │   ├── ratings.js            # Notations
│   │   │   └── bookmarks.js          # Favoris
│   │   │
│   │   ├── controllers/              # Logique métier
│   │   │   ├── user.js               # Auth (jws) + CRUD users
│   │   │   ├── advice.js             # CRUD conseils
│   │   │   ├── category.js           # CRUD catégories
│   │   │   └── comment.js            # CRUD commentaires
│   │   │
│   │   ├── routes/                   # Routes Express
│   │   │   ├── router.js             # Router principal
│   │   │   ├── user.js               # /login, /register, /me, /api/users
│   │   │   ├── advice.js             # /api/advices, /api/search
│   │   │   ├── category.js           # /api/categories
│   │   │   └── comment.js            # /api/comments
│   │   │
│   │   ├── util/
│   │   │   ├── updatedb.js           # Init DB + seed data
│   │   │   ├── swagger.js            # Générateur doc API
│   │   │   └── swagger-output.json   # Doc générée
│   │   │
│   │   ├── __tests__/                # Tests Jest
│   │   │   ├── api.user.test.js
│   │   │   ├── api.advice.test.js
│   │   │   └── api.category.test.js
│   │   │
│   │   └── frontend/                 # Build React (production)
│   │
│   ├── .env                          # Variables d'environnement
│   ├── package.json
│   └── Procfile                      # Déploiement Scalingo
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # Point d'entrée React
│   │   ├── App.jsx                   # Router + Layout
│   │   │
│   │   ├── components/               # Composants réutilisables
│   │   │   ├── Header.jsx
│   │   │   ├── AdviceCard.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   │
│   │   ├── views/                    # Pages
│   │   │   ├── Home.jsx
│   │   │   ├── AdviceDetail.jsx
│   │   │   ├── CreateAdvice.jsx
│   │   │   ├── MyAdvices.jsx
│   │   │   ├── Bookmarks.jsx
│   │   │   ├── Search.jsx
│   │   │   └── AdminPanel.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Gestion authentification
│   │   │
│   │   └── services/
│   │       └── api.js                # Client API (x-access-token)
│   │
│   ├── cypress/                      # Tests E2E
│   │   ├── e2e/
│   │   │   ├── auth.cy.js
│   │   │   ├── advices.cy.js
│   │   │   └── admin.cy.js
│   │   ├── fixtures/
│   │   └── support/
│   │
│   ├── cypress.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitlab-ci.yml                    # CI/CD GitLab
├── .gitignore
└── README.md
```

## API Endpoints

### Authentification

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/login` | POST | Connexion (email, password) → token | Non |
| `/register` | POST | Inscription (name, email, password) | Non |
| `/me` | GET | Profil utilisateur connecté | TOKEN |
| `/health` | GET | Health check | Non |

### Utilisateurs

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/users` | GET | Lister tous les utilisateurs | TOKEN |
| `/api/users/:id` | PUT | Modifier un utilisateur | ADMIN |
| `/api/users/:id` | DELETE | Supprimer un utilisateur | ADMIN |
| `/api/password` | PUT | Modifier son mot de passe | TOKEN |

### Conseils d'Investissement

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/advices` | GET | Lister les conseils (pagination) | Non |
| `/api/advices/latest` | GET | Derniers conseils | Non |
| `/api/advices/:id` | GET | Détail d'un conseil | Non |
| `/api/advices` | POST | Créer un conseil | TOKEN |
| `/api/advices/:id` | PUT | Modifier un conseil | OWNER/ADMIN |
| `/api/advices/:id` | DELETE | Supprimer un conseil | OWNER/ADMIN |
| `/api/myadvices` | GET | Mes conseils | TOKEN |
| `/api/advices/:id/rate` | POST | Noter un conseil | TOKEN |
| `/api/advices/:id/bookmark` | POST | Ajouter aux favoris | TOKEN |
| `/api/advices/:id/bookmark` | DELETE | Retirer des favoris | TOKEN |
| `/api/bookmarks` | GET | Mes favoris | TOKEN |
| `/api/search` | GET | Recherche (q, category, type) | Non |

### Catégories

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/categories` | GET | Arbre des catégories | Non |
| `/api/categories/flat` | GET | Liste plate des catégories | Non |
| `/api/categories/:id` | GET | Détail d'une catégorie | Non |
| `/api/categories` | POST | Créer une catégorie | ADMIN |
| `/api/categories/:id` | PUT | Modifier une catégorie | ADMIN |
| `/api/categories/:id` | DELETE | Supprimer une catégorie | ADMIN |

### Commentaires

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/advices/:id/comments` | GET | Commentaires d'un conseil | Non |
| `/api/advices/:id/comments` | POST | Ajouter un commentaire | TOKEN |
| `/api/comments/:id` | PUT | Modifier un commentaire | OWNER/ADMIN |
| `/api/comments/:id` | DELETE | Supprimer un commentaire | OWNER/ADMIN |
| `/api/comments/:id/flag` | POST | Signaler un commentaire | TOKEN |
| `/api/comments/flagged` | GET | Commentaires signalés | ADMIN |
| `/api/comments/:id/approve` | PUT | Approuver un commentaire | ADMIN |

## Modèle de Données

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Advice    │       │  Category   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ name        │──────<│ authorId    │       │ name        │
│ email       │       │ title       │>─────<│ description │
│ passhash    │       │ summary     │  M:N  │ parentId    │
│ isAdmin     │       │ content     │       │ level       │
│ status      │       │ investType  │       └─────────────┘
└─────────────┘       │ estimatedGain│
      │               │ confidence  │       ┌─────────────┐
      │               │ status      │       │  Comment    │
      │               └─────────────┘       ├─────────────┤
      │                     │               │ id          │
      │                     │               │ adviceId    │
      │                     │               │ authorId    │
      └─────────────────────┼───────────────│ content     │
                            │               │ status      │
                      ┌─────────────┐       │ flagged     │
                      │   Rating    │       └─────────────┘
                      ├─────────────┤
                      │ id          │       ┌─────────────┐
                      │ userId      │       │  Bookmark   │
                      │ adviceId    │       ├─────────────┤
                      │ score (1-5) │       │ userId      │
                      └─────────────┘       │ adviceId    │
                                            └─────────────┘
```

## Gestion des Rôles

| Rôle | Droits |
|------|--------|
| **Visiteur** | Consulter conseils, catégories, rechercher |
| **Utilisateur** | + Créer/modifier/supprimer ses conseils, commenter, noter, favoris |
| **Admin** | + Gérer catégories, modérer contenus, gérer utilisateurs |

## Installation et Test Local

### Prérequis

- Node.js >= 18
- npm >= 9

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Initialiser la base de données avec données de test
npm run updatedb

# Lancer les tests Jest (54 tests)
npm run test

# Générer la documentation Swagger
npm run doc

# Démarrer en mode développement (hot reload)
npm run startdev

# Démarrer en mode production
npm start
```

**URLs Backend :**
- API : http://localhost:3000
- Documentation Swagger : http://localhost:3000/doc
- Health check : http://localhost:3000/health

**Comptes de test :**
- Admin : `admin@example.com` / `admin123`
- User : `user@example.com` / `user123`

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Lancer les tests Cypress (29 tests)
npm run cypress:run

# Cypress en mode interactif
npm run cypress:open
```

**URL Frontend :** http://localhost:5173

### Test Complet (Backend + Frontend + Cypress)

```bash
# Terminal 1 - Backend
cd backend && npm run updatedb && npm run startdev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Tests Cypress
cd frontend && npm run cypress:run
```

## Variables d'Environnement

### Backend (.env)

```bash
PORT=3000
DB=bd.sqlite
SECRET=your-secret-key-change-in-production
```

### Frontend

```bash
VITE_API_URL=http://localhost:3000   # Dev
VITE_API_URL=https://app.scalingo.io # Prod
```

## Tests

| Suite | Tests | Couverture |
|-------|-------|------------|
| Backend Jest | 54 | 67% |
| Cypress E2E | 29 | - |
| **Total** | **83** | - |

### Backend (Jest + Supertest)

```bash
cd backend
npm run test
```

Tests couvrent :
- Authentification (register, login, token)
- CRUD utilisateurs
- CRUD conseils + bookmarks + ratings
- CRUD catégories (hiérarchie)

### Frontend (Cypress)

```bash
cd frontend
npm run cypress:run
```

Tests couvrent :
- `auth.cy.js` : inscription, connexion, déconnexion
- `advices.cy.js` : liste, détail, création, recherche
- `admin.cy.js` : panel admin, gestion users/catégories/modération

## CI/CD

Le fichier `.gitlab-ci.yml` configure :

1. **Stage test** : Tests backend (Jest) + frontend (Cypress) + lint
2. **Stage build** : Build frontend pour production
3. **Stage deploy** : Déploiement sur Scalingo (manuel)

### Variables GitLab requises

Dans Settings > CI/CD > Variables :
- `SCALINGO_API_TOKEN` : Token API Scalingo
- `SCALINGO_APP_NAME` : Nom de l'application

## Auteur

- Alexandre Grondin

## Licence

Projet académique - ENSIMAG 2024-2025
