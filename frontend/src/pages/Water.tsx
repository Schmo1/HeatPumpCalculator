import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { WaterPeriod, WaterPeriodInput } from "../types";
import { num, pct } from "../utils/format";

const empty: WaterPeriodInput = {
  label: "", sortOrder: 0, isBaseline: false,
  totalMeterReading: null, davidColdReading: null, davidWarmReading: null,
  sarahColdReading: null, sarahWarmReading: null,
};

export default function Water() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<WaterPeriod[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<WaterPeriodInput>(empty);

  async function load() {
    setLoading(true);
    try { setRows(await api.get<WaterPeriod[]>("/api/water-periods")); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startAdd() {
    setForm({ ...empty, sortOrder: (rows.at(-1)?.sortOrder ?? 0) + 1 });
    setAdding(true); setEditId(null);
  }
  function startEdit(w: WaterPeriod) {
    setForm({
      label: w.label, sortOrder: w.sortOrder, isBaseline: w.isBaseline,
      totalMeterReading: w.totalMeterReading, davidColdReading: w.davidColdReading,
      davidWarmReading: w.davidWarmReading, sarahColdReading: w.sarahColdReading,
      sarahWarmReading: w.sarahWarmReading,
    });
    setEditId(w.id); setAdding(false);
  }
  async function save() {
    try {
      if (editId) await api.put(`/api/water-periods/${editId}`, form);
      else await api.post("/api/water-periods", form);
      setAdding(false); setEditId(null); await load();
    } catch (e) { setError((e as Error).message); }
  }
  async function del(id: number) {
    if (!confirm("Wasser-Zeitraum löschen?")) return;
    try { await api.del(`/api/water-periods/${id}`); await load(); }
    catch (e) { setError((e as Error).message); }
  }

  if (loading) return <p className="muted">Lädt…</p>;

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>Wasser</h1>
          <p className="subtitle">
            Zählerstände kalt/warm je Wohnung. Sarahs Zähler zählen rückwärts ab 100000.
            Berechnete Spalten sind blau hervorgehoben.
          </p>
        </div>
        {isAdmin && !adding && editId === null && <button onClick={startAdd}>+ Zeitraum</button>}
      </div>
      {error && <div className="error">{error}</div>}

      {(adding || editId !== null) && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{editId ? "Zeitraum bearbeiten" : "Neuer Zeitraum"}</h3>
          <div className="form-grid">
            <div><label>Bezeichnung</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
            <div><label>Reihenfolge</label><input type="number" step="any" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseFloat(e.target.value) || 0 })} /></div>
            <div>
              <label>Basiszeile (Init)</label>
              <select value={form.isBaseline ? "1" : "0"} onChange={(e) => setForm({ ...form, isBaseline: e.target.value === "1" })}>
                <option value="0">Nein</option>
                <option value="1">Ja</option>
              </select>
            </div>
            <NumField label="Zählerstand gesamt" v={form.totalMeterReading} set={(n) => setForm({ ...form, totalMeterReading: n })} />
            <NumField label="Kalt David" v={form.davidColdReading} set={(n) => setForm({ ...form, davidColdReading: n })} />
            <NumField label="Warm David" v={form.davidWarmReading} set={(n) => setForm({ ...form, davidWarmReading: n })} />
            <NumField label="Kalt Sarah" v={form.sarahColdReading} set={(n) => setForm({ ...form, sarahColdReading: n })} />
            <NumField label="Warm Sarah" v={form.sarahWarmReading} set={(n) => setForm({ ...form, sarahWarmReading: n })} />
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button onClick={save}>Speichern</button>
            <button className="secondary" onClick={() => { setAdding(false); setEditId(null); }}>Abbrechen</button>
          </div>
        </div>
      )}

      <div className="card table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Zeitraum</th>
              <th>Zähler gesamt</th>
              <th>Verbrauch gesamt</th>
              <th>David kalt</th><th>David warm</th><th>David gesamt</th>
              <th>Sarah kalt</th><th>Sarah warm</th><th>Sarah gesamt</th>
              <th>Warmw.-Anteil Sarah</th><th>Gesamt-Anteil Sarah</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} style={w.isBaseline ? { color: "var(--muted)" } : undefined}>
                <td>{w.label}{w.isBaseline && " (Basis)"}</td>
                <td>{num(w.totalMeterReading)}</td>
                <td className="computed">{num(w.totalConsumption)}</td>
                <td className="computed">{num(w.davidCold)}</td>
                <td className="computed">{num(w.davidWarm)}</td>
                <td className="computed">{num(w.davidTotal)}</td>
                <td className="computed">{num(w.sarahCold)}</td>
                <td className="computed">{num(w.sarahWarm)}</td>
                <td className="computed">{num(w.sarahTotal)}</td>
                <td className="computed">{pct(w.sarahWarmRatioPercent)}</td>
                <td className="computed">{pct(w.sarahTotalRatioPercent)}</td>
                {isAdmin && (
                  <td><div className="row-actions">
                    <button className="secondary small" onClick={() => startEdit(w)}>✎</button>
                    <button className="danger small" onClick={() => del(w.id)}>🗑</button>
                  </div></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function NumField({ label, v, set }: { label: string; v: number | null; set: (n: number | null) => void }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        step="any"
        value={v ?? ""}
        onChange={(e) => set(e.target.value === "" ? null : parseFloat(e.target.value))}
      />
    </div>
  );
}
