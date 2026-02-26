export default function AdminDashboardPage() {
  const links = [
    {
      href: "/admin/venues",
      title: "Lokacije + regioni + kapaciteti",
      desc: "Upravljanje lokacijama, regionima sedenja i kapacitetima.",
    },
    {
      href: "/admin/categories",
      title: "Kategorije",
      desc: "Dodavanje i izmena kategorija koncerata.",
    },
    {
      href: "/admin/shows",
      title: "Zakazivanje + cene po regionu",
      desc: "Kreiranje termina i definisanje cena po regionima.",
    },
    {
      href: "/admin/currencies",
      title: "Valute",
      desc: "Uključivanje i isključivanje valuta za plaćanje.",
    },
    {
      href: "/admin/settings",
      title: "Popust 10% ",
      desc: "Podešavanje datuma do kog važi promotivni popust.",
    },
  ];

  return (
    <div className="mx-auto mt-12 w-full max-w-5xl px-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Admin panel
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Upravljanje osnovnim podacima sistema za rezervaciju karata.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-white/20 hover:bg-black/40"
            >
              <div className="text-base font-semibold text-white group-hover:text-white">
                {link.title}
              </div>
              <div className="mt-1 text-sm text-white/60">
                {link.desc}
              </div>

              <div className="mt-4 text-xs text-white/40 group-hover:text-white/60">
                Otvori →
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}