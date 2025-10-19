"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function SuppliersPage() {
  const [vat, setVat] = useState("FR12345678901");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const res = await fetch("/api/vies/valider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vat })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Erreur validation");
      setResult(json.data.valid ? "Numéro de TVA valide" : "Numéro non confirmé");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">Identifier des fournisseurs</h1>
        <p className="text-slate-600">
          Utilisez VIES pour vérifier un numéro de TVA européen et documenter vos partenaires.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label htmlFor="vat" className="text-sm font-medium text-slate-700">
          Numéro de TVA intracommunautaire
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            id="vat"
            value={vat}
            onChange={(event) => setVat(event.target.value.toUpperCase())}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-base uppercase focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="FR12345678901"
            required
          />
          <Button type="submit" className="md:w-48" disabled={loading}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Vérifier
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && <p className="text-sm font-medium text-brand">{result}</p>}
      </form>

      <section className="rounded-xl border border-dashed border-brand/40 bg-white p-6 text-sm text-slate-600">
        <h2 className="mb-3 text-xl font-semibold text-brand">Bonnes pratiques</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Demandez des documents légaux (Kbis, certificats) pour toute relation fournisseurs.</li>
          <li>Planifiez des visites virtuelles ou physiques pour valider la capacité de production.</li>
          <li>Archivez les preuves de contrôle TVA pour sécuriser votre conformité.</li>
        </ul>
      </section>
    </div>
  );
}
