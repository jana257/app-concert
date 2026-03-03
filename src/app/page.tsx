import { headers } from "next/headers";
type Category = {
  id: string;
  name: string;
  events: Event[];
};

type Event = {
  id: string;
  title: string;
  artist: string;
  shows: Show[];
};

type Show = {
  id: string;
  startsAt: string;
  venue: {
    name: string;
    city: string;
  };
};

export default async function HomePage() {
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${protocol}://${host}/api/home`, { cache: "no-store" });

  if (!res.ok) {
    return <div>Greška pri učitavanju koncerata.</div>;
  }

  const data = await res.json();
  const categories: Category[] = data.categories;

  return (
    <main style={{ padding: 24 }}>
      <h1>🎟️ Koncerti</h1>
      <p>Izaberite koncert i termin za rezervaciju karata.</p>

      {categories.length === 0 && <p>Nema dostupnih koncerata.</p>}

      {categories.map((category) => (
        <section key={category.id} style={{ marginTop: 32 }}>
          <h2>{category.name}</h2>

          {category.events.map((event) => (
            <div
              key={event.id}
              style={{
                marginTop: 16,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <h3>
                {event.artist} – {event.title}
              </h3>

              {event.shows.length === 0 ? (
                <p>Nema dostupnih termina.</p>
              ) : (
                <ul>
                  {event.shows.map((show) => (
                    <li key={show.id}>
                      <a
                        href={`/reserve/${show.id}`}
                        style={{ textDecoration: "underline" }}
                      >
                        {new Date(show.startsAt).toLocaleDateString()} –{" "}
                        {show.venue.name}, {show.venue.city}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
