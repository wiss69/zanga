import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Zinga.io",
  description: "Plateforme pour débuter dans l'e-commerce international",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-brand-background text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
