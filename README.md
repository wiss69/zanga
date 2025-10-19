# Zinga.io

Plateforme Next.js 14 App Router pour accompagner les importateurs débutants dans la découverte de produits à potentiel, la
qualification de fournisseurs et la simulation de coûts.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS, shadcn/ui, Lucide Icons
- Auth prévu avec NextAuth (JWT)
- Cache Redis (fallback LRU mémoire)
- Tests : Vitest + React Testing Library + Playwright
- CI GitHub Actions, déploiement Vercel

## Démarrage

```bash
npm install
npm run dev
```

Variables d’environnement : voir `.env.example`.

## Scripts utiles

- `npm run dev` — lance le serveur Next.js en mode développement.
- `npm run build` — build de production.
- `npm run lint` — lint via ESLint.
- `npm run type-check` — vérifie les types TypeScript.
- `npm run test` — tests unitaires Vitest.
- `npm run test:e2e` — tests Playwright.

## Tests

Vitest est configuré avec JSDOM et RTL (`vitest.setup.ts`). Les tests E2E se trouvent dans `tests/e2e/` et utilisent le runner
Playwright.

## API internes

Les routes API se trouvent dans `app/api/*` et respectent un schéma de réponse normalisé :

```json
{
  "ok": true,
  "data": {}
}
```

En cas d’erreur :

```json
{
  "ok": false,
  "error": "message",
  "code": "IDENTIFIANT",
  "status": 400
}
```

Chaque endpoint applique un rate limit IP (60 req/min), un timeout à 8 secondes et jusqu’à deux retries sur erreurs transitoires.
