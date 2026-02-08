type Props = {
  searchParams?: Promise<{
    cancelled?: string;
    updated?: string;
  }>;
};

export default async function ManagePage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const cancelled = sp.cancelled === "1";
  const updated = sp.updated === "1";

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h1>Upravljanje kartom</h1>
      <p>
        Unesi <b>email</b> i <b>šifru (accessCode)</b> da pronađeš svoju kartu.
      </p>

      {cancelled && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          ✅ Karta je uspešno otkazana.
        </div>
      )}

      {updated && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          ✅ Izmene su uspešno sačuvane.
        </div>
      )}

      <form method="post" action="/api/reservations/lookup" style={{ marginTop: 16 }}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="npr. natasa@gmail.com"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="accessCode">Šifra (accessCode)</label>
          <br />
          <input
            id="accessCode"
            name="accessCode"
            type="text"
            required
            placeholder="npr. fac88ed7-a445-..."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" style={{ marginTop: 16 }}>
          Pronađi kartu
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 14 }}>
        ℹ️ Šifru dobijaš nakon rezervacije na stranici <b>“Rezervacija uspešna”</b>.
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <a href="/" style={{ textDecoration: "underline" }}>
          ← Nazad na početnu
        </a>
        <a href="/" style={{ textDecoration: "underline" }}>
          + Nova rezervacija
        </a>
      </div>
    </main>
  );
}

