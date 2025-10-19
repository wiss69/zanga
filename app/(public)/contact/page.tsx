export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand">Contact</h1>
        <p className="text-slate-600">
          Pour toute question, contactez l&apos;équipe Zinga.io via le formulaire ci-dessous.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Email : <a className="text-brand underline" href="mailto:hello@zinga.io">hello@zinga.io</a>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Réseaux : <span className="text-brand">@zinga_io</span> sur les plateformes professionnelles.
        </p>
      </section>
    </div>
  );
}
