import { prisma } from "@/lib/prisma";
import { getDiscountUntil } from "@/lib/settings";
import ReserveForm from "./ReserveForm";

type Props = {
  params: Promise<{ showId: string }>;
};

export default async function ReservePage({ params }: Props) {
  const { showId } = await params;

  if (!showId) return <main style={{ padding: 24 }}>Nedostaje showId.</main>;

  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      event: true,
      venue: true,
      prices: { include: { region: true } },
    },
  });

  if (!show) return <main style={{ padding: 24 }}>Termin nije pronađen.</main>;

  const discountUntil = await getDiscountUntil();

  const prices = show.prices.map((p) => ({
    regionId: p.region.id,
    regionName: p.region.name,
    priceRsd: p.priceRsd,
  }));

  return (
    <main style={{ padding: 24 }}>
      <h1>
        {show.event.artist} – {show.event.title}
      </h1>

      <p>
        📍 {show.venue.name}, {show.venue.city}
      </p>
      <p>📅 {new Date(show.startsAt).toLocaleString()}</p>

      <h2>Cene po regionima</h2>
      <ul>
        {show.prices.map((p) => (
          <li key={p.id}>
            {p.region.name}: {p.priceRsd} RSD
          </li>
        ))}
      </ul>

      <h2>Rezervacija</h2>

      <ReserveForm
        showId={show.id}
        prices={prices}
        discountUntilISO={discountUntil ? discountUntil.toISOString() : null}
      />
    </main>
  );
}
