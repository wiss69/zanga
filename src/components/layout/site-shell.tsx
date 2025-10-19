'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils/cn';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/discover', label: 'Découvrir' },
  { href: '/suppliers', label: 'Fournisseurs' },
  { href: '/simulator', label: 'Simuler' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/guides', label: 'Guides' },
  { href: '/user', label: 'Espace utilisateur' },
  { href: '/contact', label: 'Contact' }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-primary">
            Zinga.io
          </Link>
          <button
            type="button"
            className="md:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((state) => !state)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav
          className={cn(
            'border-t border-slate-200 bg-white px-6 py-4 md:hidden',
            open ? 'block' : 'hidden'
          )}
        >
          <ul className="grid gap-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-1 bg-background">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Zinga.io — Accélérez vos opérations import/export.</p>
          <div className="flex flex-wrap items-center gap-3">
            {['ECB', 'UN Comtrade', 'REST Countries', 'TARIC', 'Open-Meteo'].map((source) => (
              <span key={source} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                {source}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
