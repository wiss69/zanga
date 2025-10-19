"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Globe2, Layers3, LineChart, PackageSearch } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export const dynamic = "force-dynamic";

type Card = {
  title: string;
  description: string;
  href: Route;
  icon: LucideIcon;
};

const cards: Card[] = [
  {
    title: "Découvrir",
    description: "Explorez les tendances de produits import/export par code HS.",
    href: "/discover",
    icon: PackageSearch
  },
  {
    title: "Fournisseurs",
    description: "Identifiez et vérifiez des fournisseurs grâce à VIES.",
    href: "/suppliers",
    icon: Globe2
  },
  {
    title: "Simuler",
    description: "Estimez vos coûts : devises, droits, transport et documents.",
    href: "/simulator",
    icon: Layers3
  },
  {
    title: "Tendances",
    description: "Suivez les flux internationaux via UN Comtrade.",
    href: "/dashboard",
    icon: LineChart
  }
];

const sources = [
  { name: "ECB", url: "https://www.ecb.europa.eu/" },
  { name: "UN Comtrade", url: "https://comtradeplus.un.org/" },
  { name: "REST Countries", url: "https://restcountries.com/" },
  { name: "TARIC", url: "https://ec.europa.eu/taxation_customs/" },
  { name: "Open-Meteo", url: "https://open-meteo.com/" }
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-12">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-light">
            Plateforme e-commerce
          </span>
          <h1 className="text-4xl font-bold text-brand">
            Zinga.io — lancez vos projets import/export en confiance
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Outils pédagogiques, données temps réel et simulateurs pour comprendre les flux
            internationaux, identifier des partenaires et maîtriser vos coûts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/discover">
                Explorer les données
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={"/guides" as Route}>Guides pédagogiques</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-brand hover:shadow-lg"
          >
            <card.icon className="h-10 w-10 text-brand" />
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">{card.title}</h2>
              <p className="text-slate-600">{card.description}</p>
            </div>
            <span className="text-sm font-medium text-brand-light group-hover:translate-x-1 group-hover:text-brand">
              Accéder
            </span>
          </Link>
        ))}
      </section>

      <footer className="rounded-xl bg-white p-6 text-sm text-slate-600">
        <h3 className="mb-2 text-base font-semibold text-brand">Sources de données</h3>
        <ul className="flex flex-wrap gap-3">
          {sources.map((source) => (
            <li key={source.name}>
              <a
                className="underline decoration-brand/40 underline-offset-2 hover:text-brand"
                href={source.url}
                rel="noreferrer"
                target="_blank"
              >
                {source.name}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </main>
  );
}
