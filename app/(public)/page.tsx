import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

const featureCards = [
  {
    title: 'Découvrir des produits',
    description:
      'Analysez des milliers de catégories pour identifier les produits à fort potentiel sur les marchés européens.',
    href: '/discover'
  },
  {
    title: 'Fournisseurs fiables',
    description:
      'Évaluez la fiabilité de vos fournisseurs avec la validation VIES et un scoring transparence.',
    href: '/suppliers'
  },
  {
    title: 'Simuler vos coûts',
    description:
      'Estimez vos coûts réels d’importation avec taux de change, droits de douane et logistique.',
    href: '/simulator'
  },
  {
    title: 'Suivre les tendances',
    description:
      'Visualisez les volumes import/export et anticipez les ruptures grâce aux données UN Comtrade.',
    href: '/dashboard'
  }
];

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-white via-[#F8FAFC] to-[#E2E8F0]">
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Plateforme e-commerce pour importateurs ambitieux
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Repérez, sécurisez et lancez vos produits import/export en toute confiance.
          </h1>
          <p className="text-lg text-slate-600">
            Zinga.io centralise les données clés pour analyser les tendances, qualifier vos partenaires et estimer les coûts réels
            avant d’investir sur un nouveau produit.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/discover">
                Commencer l&apos;exploration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/guides">Consulter les guides</Link>
            </Button>
          </div>
        </div>
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative rounded-3xl border border-primary/30 bg-white p-8 shadow-xl">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-primary">Indice de potentiel produit</h2>
              <div className="grid gap-3">
                {[72, 64, 58, 55].map((score, index) => (
                  <div key={score} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Produit #{index + 1}</span>
                      <span>{score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Données agrégées UN Comtrade &amp; Zinga Labs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-2">
        {featureCards.map((feature) => (
          <Card key={feature.title} className="border-primary/20">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600">
              <p>{feature.description}</p>
              <Button variant="ghost" asChild>
                <Link href={feature.href} className="inline-flex items-center">
                  En savoir plus
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
