export default function AdminDiscountPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin: 10% popust</h1>

      <form method="post" action="/api/admin/settings/discount">
        <div>
          <label htmlFor="until">Važi do (YYYY-MM-DD)</label>
          <br />
          <input id="until" name="until" type="date" />
        </div>

        <button type="submit" style={{ marginTop: 12 }}>
          Sačuvaj
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
        Ako ostaviš prazno i pošalješ, popust se gasi (možemo dodati dugme “Obriši” ako želiš).
      </p>
    </main>
  );
}
