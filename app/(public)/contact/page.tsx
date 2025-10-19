import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-primary">Contact</h1>
        <p className="text-slate-600">
          Besoin d’un accompagnement personnalisé ? L’équipe Zinga répond à vos questions en moins de 24h.
        </p>
      </header>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Écrire à Zinga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Nom</Label>
              <Input id="contact-name" placeholder="Votre nom" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="vous@entreprise.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Projet</Label>
            <Textarea id="contact-message" placeholder="Décrivez votre besoin" />
          </div>
          <Button>Envoyer</Button>
          <p className="text-xs text-slate-400">Ou écrivez-nous directement sur hello@zinga.io.</p>
        </CardContent>
      </Card>
    </div>
  );
}
