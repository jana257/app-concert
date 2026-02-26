"use client";

import { useEffect, useState } from "react";

type Row = { id: string; name: string };

async function readJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();

  const text = await res.text();
  throw new Error(
    `Server nije vratio JSON (status ${res.status}). Body: ${text.slice(0, 200)}`
  );
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const res = await fetch("/api/admin/categories", {
        headers: { Accept: "application/json" },
      });
      const data = await readJson(res);
      if (!data.ok) return setErr(data.error || "Greška");
      setRows(data.rows);
    } catch (e: any) {
      setErr(e?.message || "Greška pri učitavanju.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      setErr(null);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await readJson(res);
      if (!data.ok) return setErr(data.error || "Greška");

      setName("");
      load();
    } catch (e: any) {
      setErr(e?.message || "Greška pri čuvanju.");
    }
  }

  async function rename(id: string, newName: string) {
    try {
      setErr(null);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await readJson(res);
      if (!data.ok) return setErr(data.error || "Greška");

      load();
    } catch (e: any) {
      setErr(e?.message || "Greška pri izmeni.");
    }
  }

  async function del(id: string) {
    if (!confirm("Obrisati kategoriju?")) return;

    try {
      setErr(null);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await readJson(res);
      if (!data.ok)
        return setErr(
          data.error || "Ne može da se obriše ako postoje eventi u toj kategoriji."
        );

      load();
    } catch (e: any) {
      setErr(e?.message || "Greška pri brisanju.");
    }
  }

  const inputBase =
    "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:bg-black/40 placeholder:text-white/40";
  const btnPrimary =
    "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90";
  const btnGhost =
    "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10";
  const btnDanger =
    "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/15";

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Kategorije</h1>
      <p className="mt-2 text-sm text-white/70">
        Dodaj / izmeni / obriši kategorije koncerata.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Nova kategorija</h2>

        <form onSubmit={create} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Naziv kategorije</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Naziv kategorije"
              aria-label="Naziv kategorije"
              title="Naziv kategorije"
              className={inputBase}
            />
          </label>

          <button type="submit" className={btnPrimary}>
            Dodaj
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Lista</h2>
          <button type="button" onClick={load} className={btnGhost}>
            Osveži
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-white/60">
                <th className="px-4 py-3 border-b border-white/10">Naziv</th>
                <th className="px-4 py-3 border-b border-white/10">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <CategoryRow
                  key={r.id}
                  row={r}
                  onRename={rename}
                  onDelete={del}
                  inputBase={inputBase}
                  btnPrimary={btnPrimary}
                  btnGhost={btnGhost}
                  btnDanger={btnDanger}
                />
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-white/70" colSpan={2}>
                    Nema kategorija.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <a
          href="/admin/dashboard"
          className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
        >
          ← Nazad
        </a>
      </div>
    </div>
  );
}

function CategoryRow({
  row,
  onRename,
  onDelete,
  inputBase,
  btnPrimary,
  btnGhost,
  btnDanger,
}: {
  row: Row;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  inputBase: string;
  btnPrimary: string;
  btnGhost: string;
  btnDanger: string;
}) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(row.name);

  function save() {
    setEdit(false);
    onRename(row.id, val);
  }

  function cancel() {
    setEdit(false);
    setVal(row.name);
  }

  return (
    <tr className="align-middle hover:bg-white/5">
      <td className="px-4 py-3 border-b border-white/10 text-sm text-white/85">
        {edit ? (
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            aria-label={`Izmeni kategoriju ${row.name}`}
            title={`Izmeni kategoriju ${row.name}`}
            placeholder="Naziv kategorije"
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            className={inputBase}
          />
        ) : (
          row.name
        )}
      </td>

      <td className="px-4 py-3 border-b border-white/10">
        {edit ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} className={btnPrimary}>
              Sačuvaj
            </button>
            <button type="button" onClick={cancel} className={btnGhost}>
              Otkaži
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setEdit(true)} className={btnGhost}>
              Izmeni
            </button>
            <button type="button" onClick={() => onDelete(row.id)} className={btnDanger}>
              Obriši
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}