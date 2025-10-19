import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';

const preferences = [
  { label: 'Alertes FX quotidiennes', value: true },
  { label: 'Suivi météo ports favoris', value: true },
  { label: 'Newsletter tendances', value: false }
];

const favorites = [
  { name: 'Accessoires solaires portables', hs: '850760', lastUpdate: '11/03/2024' },
  { name: 'Cosmétiques bio', hs: '330499', lastUpdate: '06/03/2024' }
];

export default function UserPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Espace utilisateur</h1>
        <p className="text-slate-600">Gérez votre profil, vos préférences et vos favoris Zinga.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nom</Label>
              <Input id="user-name" defaultValue="Camille Durand" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" defaultValue="camille@zinga.io" />
            </div>
            <Button>Mettre à jour</Button>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {preferences.map((preference) => (
              <div key={preference.label} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                <span>{preference.label}</span>
                <Badge variant={preference.value ? 'default' : 'outline'}>
                  {preference.value ? 'Activé' : 'Inactif'}
                </Badge>
              </div>
            ))}
            <Button variant="outline">Personnaliser</Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Produits favoris</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {favorites.map((item) => (
              <div key={item.hs} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <Badge variant="outline">HS {item.hs}</Badge>
                </div>
                <p className="text-xs text-slate-500">Dernière mise à jour : {item.lastUpdate}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
