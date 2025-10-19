# Zinga.io

Plateforme Next.js 14 pour découvrir des produits d&apos;import/export, vérifier des fournisseurs et simuler ses coûts.

## Stack
- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS, shadcn/ui, Lucide
- SQLite ou Postgres (DATABASE_URL), cache Redis optionnel (fallback mémoire)
- NextAuth (placeholder), Vitest + Playwright pour les tests

## Scripts
- `npm run dev` : démarrer le serveur de développement
- `npm run build` : compiler l&apos;application pour la production
- `npm run start` : lancer la version compilée
- `npm run lint` : vérifier les règles ESLint
- `npm run type-check` : vérifier les types TypeScript
- `npm run test` : exécuter les tests Vitest

## Variables d&apos;environnement
Copiez `.env.example` vers `.env.local` et ajustez les clés selon vos services.

## Déploiement
La configuration CI se trouve dans `.github/workflows/ci.yml` (Node 20). L&apos;application est prête pour un déploiement sur Vercel.
