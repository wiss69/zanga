import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

const suppliers = [
  {
    name: 'Nordic Components GmbH',
    country: 'DE',
    category: 'Électronique',
    score: 92,
    vat: 'DE123456789',
    reliability: 'TVA validée, 12 ans d’activité'
  },
  {
    name: 'Green Beauty Labs',
    country: 'FR',
    category: 'Cosmétiques',
    score: 88,
    vat: 'FR987654321',
    reliability: 'TVA validée, 7 ans d’activité'
  },
  {
    name: 'EcoLog Italia',
    country: 'IT',
    category: 'Logistique',
    score: 84,
    vat: 'IT112233445',
    reliability: 'TVA validée, 5 ans d’activité'
  }
];

export default function SuppliersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">Fournisseurs vérifiés</h1>
        <p className="text-slate-600">
          Filtrez les fournisseurs par pays et catégorie. Chaque profil est enrichi des résultats VIES et d’un scoring fiabilité.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-4">
        <div className="space-y-4 rounded-xl border border-primary/20 bg-white p-6 shadow-sm md:col-span-1">
          <div className="space-y-2">
            <Label htmlFor="supplier-search">Rechercher</Label>
            <Input id="supplier-search" placeholder="Nom ou TVA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-country">Pays</Label>
            <Select id="supplier-country" defaultValue="all">
              <option value="all">Tous</option>
              <option value="DE">Allemagne</option>
              <option value="FR">France</option>
              <option value="IT">Italie</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-category">Catégorie</Label>
            <Select id="supplier-category" defaultValue="all">
              <option value="all">Toutes</option>
              <option value="electronics">Électronique</option>
              <option value="cosmetics">Cosmétiques</option>
              <option value="logistics">Logistique</option>
            </Select>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.name} className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{supplier.name}</CardTitle>
                  <p className="text-sm text-slate-500">
                    {supplier.category} · {supplier.country}
                  </p>
                </div>
                <Badge>{supplier.score}/100</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>TVA : {supplier.vat}</p>
                <p>{supplier.reliability}</p>
                <p className="text-xs text-slate-400">
                  Validation en temps réel via VIES. Score calculé sur la régularité TVA, l’ancienneté et les avis importateurs.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
