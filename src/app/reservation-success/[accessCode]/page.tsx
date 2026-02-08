import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CopyPromo from "./CopyPromo";

type Props = {
  params: Promise<{ accessCode: string }>;
};

export default async function ReservationSuccessPage({ params }: Props) {
  const { accessCode } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { accessCode },
    include: {
      show: { include: { event: true, venue: true } },
      items: { include: { region: true } },
      issuedPromo: true,
    },
  });

  if (!reservation) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Rezervacija nije pronađena</h1>
        <p>Proveri šifru rezervacije.</p>
        <Link href="/">Nazad na početnu</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>✅ Rezervacija uspešna</h1>

     <p>
  <b>Šifra rezervacije:</b> {reservation.accessCode}
  <br />
  <CopyPromo
    value={reservation.accessCode}
    label="📋 Kopiraj šifru rezervacije"
  />
</p>


      <p>
        <b>Koncert:</b> {reservation.show.event.artist} – {reservation.show.event.title}
        <br />
        <b>Lokacija:</b> {reservation.show.venue.name}, {reservation.show.venue.city}
        <br />
        <b>Termin:</b> {new Date(reservation.show.startsAt).toLocaleString()}
      </p>

      <h2>Stavke</h2>
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

      {reservation.promoCodeUsed ? (
        <p>
          <b>Iskorišćen promo kod:</b> {reservation.promoCodeUsed}
        </p>
      ) : null}

      <hr style={{ margin: "16px 0" }} />

      <h2>🎁 Tvoj promo kod za sledeću kupovinu</h2>

      {reservation.issuedPromo ? (
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 8, maxWidth: 360 }}>
          <p style={{ margin: 0 }}>
            <b>{reservation.issuedPromo.code}</b>
          </p>
          <p style={{ margin: "8px 0 0 0" }}>
            Popust: {reservation.issuedPromo.discountPct}% (jednokratno)
          </p>

          <CopyPromo value={reservation.issuedPromo.code} label="📋 Kopiraj promo kod" />

          <p style={{ margin: "8px 0 0 0", fontSize: 12, opacity: 0.75 }}>
            Sačuvaj kod — može se iskoristiti samo jednom.
          </p>
        </div>
      ) : (
        <p>Promo kod još nije generisan.</p>
      )}

      <div style={{ marginTop: 16 }}>
        <Link href="/">Nazad na početnu</Link>
      </div>
    </main>
  );
}
