import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ accessCode: string }>;
  searchParams: Promise<{ email?: string; cancelled?: string; updated?: string }>;
};

export default async function ManageDetailsPage({ params, searchParams }: Props) {
  const { accessCode } = await params;
  const sp = await searchParams;

  const email = (sp.email || "").trim();
  const cancelledMsg = sp.cancelled === "1";
  const updatedMsg = sp.updated === "1";

  if (!email) {
    return (
      <main style={{ padding: 24 }}>
        Nedostaje email. Vrati se na <a href="/manage">/manage</a>.
      </main>
    );
  }

  const reservation = await prisma.reservation.findFirst({
    where: { accessCode, email },
    include: {
      show: {
        include: {
          event: true,
          venue: true,
          prices: { include: { region: true } }, 
        },
      },
      items: { include: { region: true } },
    },
  });

  if (!reservation) {
    return <main style={{ padding: 24 }}>Karta nije pronađena.</main>;
  }

  const firstItem = reservation.items[0];
  const currentRegionId = firstItem?.regionId ?? reservation.show.prices[0]?.region.id ?? "";
  const currentQty = firstItem?.qty ?? 1;

  return (
    <main style={{ padding: 24 }}>
      <h1>Upravljanje kartom</h1>

      {cancelledMsg && (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginTop: 12 }}>
          ✅ Karta je uspešno otkazana.
        </div>
      )}

      {updatedMsg && (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginTop: 12 }}>
          ✅ Izmene su uspešno sačuvane.
        </div>
      )}

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

      {reservation.status !== "CANCELLED" ? (
        <>
          <hr style={{ margin: "24px 0" }} />

          <h2>Izmena karte</h2>

          {reservation.show.prices.length === 0 ? (
            <p>Nema definisanih cena za ovaj termin (show.prices je prazno).</p>
          ) : (
            <form method="post" action="/api/reservations/modify">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="accessCode" value={reservation.accessCode} />

              <div>
                <label htmlFor="regionId">Novi region</label>
                <br />
                <select id="regionId" name="regionId" required defaultValue={currentRegionId}>
                  {reservation.show.prices.map((p) => (
                    <option key={p.region.id} value={p.region.id}>
                      {p.region.name} – {p.priceRsd} RSD
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <label htmlFor="qty">Nova količina</label>
                <br />
                <input id="qty" name="qty" type="number" min={1} defaultValue={currentQty} required />
              </div>

              <button type="submit" style={{ marginTop: 16 }}>
                Sačuvaj izmene
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <hr style={{ margin: "24px 0" }} />
          <p>ℹ️ Otkazana karta ne može da se menja.</p>
        </>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2>Akcije</h2>
      <form method="post" action="/api/reservations/cancel">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="accessCode" value={reservation.accessCode} />
        <button type="submit" disabled={reservation.status === "CANCELLED"}>
          Otkaži kartu
        </button>
      </form>

      <p style={{ marginTop: 24 }}>
        <a href="/manage" style={{ textDecoration: "underline" }}>
          ← Nazad
        </a>
      </p>
    </main>
  );
}
