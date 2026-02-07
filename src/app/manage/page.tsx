export default function ManagePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Upravljanje kartom</h1>
      <p>Unesi email i šifru (accessCode) da pronađeš svoju kartu.</p>

      <form method="post" action="/api/reservations/lookup">
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input id="email" name="email" type="email" required />
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="accessCode">Šifra</label>
          <br />
          <input id="accessCode" name="accessCode" type="text" required />
        </div>

        <button type="submit" style={{ marginTop: 16 }}>
          Pronađi kartu
        </button>
      </form>

      <p style={{ marginTop: 24 }}>
        <a href="/" style={{ textDecoration: "underline" }}>
          ← Nazad na početnu
        </a>
      </p>
    </main>
  );
}
