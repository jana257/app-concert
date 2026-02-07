import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ accessCode: string }>;
  searchParams: Promise<{ email?: string }>;
};

export default async function ManageDetailsPage({ params, searchParams }: Props) {
  const { accessCode } = await params;
  const sp = await searchParams;
  const email = (sp.email || "").trim();

  if (!email) {
    return <main style={{ padding: 24 }}>Nedostaje email u URL-u.</main>;
  }

  const reservation = await prisma.reservation.findFirst({
    where: { accessCode, email },
    include: {
      show: { include: { event: true, venue: true, prices: { include: { region: true } } } },
      items: { include: { region: true } },
    },
  });

  if (!reservation) {
    return <main style={{ padding: 24 }}>Karta nije pronađena.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Upravljanje kartom</h1>

      <p>
        <b>Šifra:</b> {reservation.accessCode}
      </p>
      <p>
        <b>Status:</b> {reservation.status}
      </p>

      <hr style={{ margin: "24px 0" }} />

      <h2>Detalji koncerta</h2>
      <p>
        <b>Koncert:</b> {reservation.show.event.artist} – {reservation.show.event.title}
      </p>
      <p>
        <b>Lokacija:</b> {reservation.show.venue.name}, {reservation.show.venue.city}
      </p>
      <p>
        <b>Termin:</b> {new Date(reservation.show.startsAt).toLocaleString()}
      </p>

      <h3>Karte</h3>
      <ul>
        {reservation.items.map((it) => (
          <li key={it.id}>
            {it.region.name} × {it.qty} — {it.lineTotalRsd} RSD
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 12 }}>
        <b>Ukupno:</b> {reservation.totalRsd} RSD
      </p>

      <hr style={{ margin: "24px 0" }} />

      <h2>Akcije</h2>

      <form method="post" action="/api/reservations/cancel">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="accessCode" value={reservation.accessCode} />
        <button type="submit">Otkaži kartu</button>
      </form>

      <p style={{ marginTop: 24 }}>
        <a href="/manage" style={{ textDecoration: "underline" }}>
          ← Nazad
        </a>
      </p>
    </main>
  );
}
