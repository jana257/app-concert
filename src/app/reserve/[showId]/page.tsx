import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ showId: string }>;
};

export default async function ReservePage({ params }: Props) {
  const { showId } = await params;

  if (!showId) {
    return <main style={{ padding: 24 }}>Nedostaje showId.</main>;
  }

  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      event: true,
      venue: true,
      prices: {
        include: {
          region: true,
        },
      },
    },
  });

  if (!show) {
    return <main style={{ padding: 24 }}>Termin nije pronađen.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>
        {show.event.artist} – {show.event.title}
      </h1>

      <p>
        📍 {show.venue.name}, {show.venue.city}
      </p>
      <p>
        📅 {new Date(show.startsAt).toLocaleString()}
      </p>

      <h2>Cene po regionima</h2>
      <ul>
        {show.prices.map((p) => (
          <li key={p.id}>
            {p.region.name}: {p.priceRsd} RSD
          </li>
        ))}
      </ul>

      <h2>Rezervacija</h2>

      <form method="post" action="/api/reservations">
        {/* OBAVEZNO */}
        <input type="hidden" name="showId" value={show.id} />

        <div>
          <label htmlFor="fullName">Ime i prezime</label>
          <br />
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Unesite ime i prezime"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="example@email.com"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="regionId">Region sedenja</label>
          <br />
          <select id="regionId" name="regionId" required>
            {show.prices.map((p) => (
              <option key={p.region.id} value={p.region.id}>
                {p.region.name} – {p.priceRsd} RSD
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="qty">Količina</label>
          <br />
          <input
            id="qty"
            name="qty"
            type="number"
            min={1}
            defaultValue={1}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: 16 }}>
          Rezerviši kartu
        </button>
      </form>
    </main>
  );
}
