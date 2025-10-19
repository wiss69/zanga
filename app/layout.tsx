import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zinga.io — Plateforme e-commerce intelligente',
  description:
    'Identifiez des produits à potentiel, trouvez des fournisseurs fiables et simulez vos coûts import/export avec Zinga.io.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full bg-background text-slate-900">
      <body className={`${inter.className} min-h-screen bg-background`}>{children}</body>
    </html>
  );
}
