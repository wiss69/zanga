"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function UserPage() {
  const [email, setEmail] = useState("");
  const [hsFavorites, setHsFavorites] = useState("8517, 9403");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Préférences enregistrées localement (placeholder)");
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">Espace utilisateur</h1>
        <p className="text-slate-600">
          Connectez NextAuth et une base de données pour stocker vos préférences et favoris.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email de notification
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="vous@exemple.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="hs" className="text-sm font-medium text-slate-700">
            Codes HS favoris (séparés par une virgule)
          </label>
          <input
            id="hs"
            value={hsFavorites}
            onChange={(event) => setHsFavorites(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
          />
        </div>
        <Button type="submit" className="w-fit">
          <Save className="mr-2 h-4 w-4" /> Enregistrer
        </Button>
        {message && <p className="text-sm text-brand">{message}</p>}
      </form>
    </div>
  );
}
