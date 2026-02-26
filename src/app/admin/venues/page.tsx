"use client";

import { useEffect, useMemo, useState } from "react";

type Region = { id?: string; name: string; capacity: number };
type VenueRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  regions: { id: string; name: string; capacity: number }[];
};

function int(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export default function AdminVenuesPage() {
  const [rows, setRows] = useState<VenueRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [nvName, setNvName] = useState("");
  const [nvAddress, setNvAddress] = useState("");
  const [nvCity, setNvCity] = useState("");
  const [nvCountry, setNvCountry] = useState("Serbia");

  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(
    () => rows.find((r) => r.id === editingId) || null,
    [rows, editingId]
  );

  const [eName, setEName] = useState("");
  const [eAddress, setEAddress] = useState("");
  const [eCity, setECity] = useState("");
  const [eCountry, setECountry] = useState("Serbia");
  const [eRegions, setERegions] = useState<Region[]>([]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/venues");
      const data = await res.json();
      if (!data.ok) return setErr(data.error || "Greška");
      setRows(data.rows);
    } catch {
      setErr("Greška pri komunikaciji sa serverom.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(id: string) {
    const v = rows.find((r) => r.id === id);
    if (!v) return;

    setEditingId(id);
    setEName(v.name);
    setEAddress(v.address);
    setECity(v.city);
    setECountry(v.country);
    setERegions(v.regions.map((x) => ({ id: x.id, name: x.name, capacity: x.capacity })));
  }

  function cancelEdit() {
    setEditingId(null);
    setERegions([]);
  }

  async function createVenue(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const res = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nvName,
          address: nvAddress,
          city: nvCity,
          country: nvCountry,
        }),
      });

      const data = await res.json();
      if (!data.ok) return setErr(data.error || "Greška");

      setNvName("");
      setNvAddress("");
      setNvCity("");
      setNvCountry("Serbia");
      await load();
    } catch {
      setErr("Greška pri komunikaciji sa serverom.");
    }
  }

  async function saveVenue() {
    if (!editingId) return;
    setErr(null);

    try {
      const res = await fetch(`/api/admin/venues/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eName,
          address: eAddress,
          city: eCity,
          country: eCountry,
          regions: eRegions, 
        }),
      });

      const data = await res.json();
      if (!data.ok) return setErr(data.error || "Greška");

      setEditingId(null);
      await load();
    } catch {
      setErr("Greška pri komunikaciji sa serverom.");
    }
  }

  async function deleteVenue(id: string) {
    if (!confirm("Obrisati lokaciju?")) return;
    setErr(null);

    try {
      const res = await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) return setErr(data.error || "Greška");
      await load();
    } catch {
      setErr("Greška pri komunikaciji sa serverom.");
    }
  }

  function addRegion() {
    setERegions((prev) => [...prev, { name: "", capacity: 1, id: undefined }]);
  }

  function updateRegion(idx: number, patch: Partial<Region>) {
    setERegions((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function removeRegion(idx: number) {
    setERegions((prev) => prev.filter((_, i) => i !== idx));
  }

  const inputBase =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500";
  const btnPrimary =
    "inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50";
  const btnGhost =
    "inline-flex items-center justify-center rounded-md border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800";
  const btnDanger =
    "inline-flex items-center justify-center rounded-md border border-red-500/40 bg-transparent px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/10";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Lokacije + regioni + kapaciteti</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Dodaj lokaciju, a zatim definiši regione sedenja i kapacitete.
        </p>
      </div>

      {err && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Nova lokacija</h2>

        <form onSubmit={createVenue} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input className={inputBase} value={nvName} onChange={(e) => setNvName(e.target.value)} placeholder="Naziv" />
          </div>
          <div className="sm:col-span-2">
            <input
              className={inputBase}
              value={nvAddress}
              onChange={(e) => setNvAddress(e.target.value)}
              placeholder="Adresa"
            />
          </div>
          <input className={inputBase} value={nvCity} onChange={(e) => setNvCity(e.target.value)} placeholder="Grad" />
          <input
            className={inputBase}
            value={nvCountry}
            onChange={(e) => setNvCountry(e.target.value)}
            placeholder="Država"
          />

          <div className="sm:col-span-2 mt-2">
            <button type="submit" className={btnPrimary}>
              Kreiraj
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Postojeće lokacije</h2>
          <button onClick={load} className={btnGhost} disabled={loading}>
            Osveži
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-400">Učitavanje...</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">Nema lokacija.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="border-b border-zinc-800 px-3 py-2">Naziv</th>
                  <th className="border-b border-zinc-800 px-3 py-2">Grad</th>
                  <th className="border-b border-zinc-800 px-3 py-2">Adresa</th>
                  <th className="border-b border-zinc-800 px-3 py-2">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id} className="text-sm text-zinc-100">
                    <td className="border-b border-zinc-900 px-3 py-3">{v.name}</td>
                    <td className="border-b border-zinc-900 px-3 py-3">{v.city}</td>
                    <td className="border-b border-zinc-900 px-3 py-3">{v.address}</td>
                    <td className="border-b border-zinc-900 px-3 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(v.id)} className={btnGhost}>
                          Izmeni
                        </button>
                        <button onClick={() => deleteVenue(v.id)} className={btnDanger}>
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Izmena lokacije</h2>
            <button onClick={cancelEdit} className={btnGhost}>
              Zatvori
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input className={inputBase} value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Naziv" />
            </div>
            <div className="sm:col-span-2">
              <input
                className={inputBase}
                value={eAddress}
                onChange={(e) => setEAddress(e.target.value)}
                placeholder="Adresa"
              />
            </div>
            <input className={inputBase} value={eCity} onChange={(e) => setECity(e.target.value)} placeholder="Grad" />
            <input
              className={inputBase}
              value={eCountry}
              onChange={(e) => setECountry(e.target.value)}
              placeholder="Država"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Regioni sedenja</h3>
              <p className="mt-1 text-sm text-zinc-400">Unesi naziv regiona i kapacitet.</p>
            </div>
            <button onClick={addRegion} className={btnPrimary}>
              + Dodaj region
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {eRegions.length === 0 ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-400">
                Nema regiona — dodaj prvi region.
              </div>
            ) : (
              eRegions.map((r, idx) => (
                <div
                  key={r.id ?? idx}
                  className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900/30 p-3 sm:grid-cols-[2fr_1fr_auto]"
                >
                  <input
                    className={inputBase}
                    value={r.name}
                    onChange={(e) => updateRegion(idx, { name: e.target.value })}
                    placeholder="Naziv regiona (npr. Parter)"
                  />

                  <input
                    className={inputBase}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(r.capacity ?? 1)}
                    onChange={(e) => updateRegion(idx, { capacity: Math.max(1, int(e.target.value, 1)) })}
                    placeholder="Kapacitet"
                  />

                  <button onClick={() => removeRegion(idx)} className={btnDanger}>
                    Ukloni
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={saveVenue} className={btnPrimary}>
              Sačuvaj
            </button>
            <button onClick={cancelEdit} className={btnGhost}>
              Otkaži
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <a href="/admin/dashboard" className="text-sm text-zinc-300 hover:text-white">
          ← Nazad
        </a>
      </div>
    </div>
  );
}