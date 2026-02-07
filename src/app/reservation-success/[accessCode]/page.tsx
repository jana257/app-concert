import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ accessCode: string }>;
};

export default async function ReservationSuccessPage({ params }: Props) {
  const { accessCode } = await params;

  if (!accessCode) {
    return <main style={{ padding: 24 }}>Nedostaje accessCode u URL-u.</main>;
  }

  const reservation = await prisma.reservation.findUnique({
    where: { accessCode },
    include: {
      show: {
        include: {
          event: true,
          venue: true,
        },
      },
      items: {
        include: {
          region: true,
        },
      },
    },
  });

  if (!reservation) {
    return <main style={{ padding: 24 }}>Rezervacija nije pronađena.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>✅ Rezervacija uspešna</h1>

      <p>Sačuvaj ovu šifru (treba za izmenu i otkazivanje):</p>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          display: "inline-block",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {reservation.accessCode}
      </div>

      <hr style={{ margin: "24px 0" }} />

      <h2>Detalji</h2>
      <p>
        <b>Ime:</b> {reservation.fullName}
      </p>
      <p>
        <b>Email:</b> {reservation.email}
      </p>

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

      <p style={{ marginTop: 24 }}>
        <a href="/" style={{ textDecoration: "underline" }}>
          ← Nazad na početnu
        </a>
      </p>
    </main>
  );
}
