import { Fragment, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { BillingPeriod, BillingPeriodInput, MonthlyBillInput } from "../types";
import { eur, num } from "../utils/format";

const emptyPeriod: BillingPeriodInput = {
  label: "", sortOrder: 0, totalConsumptionKwh: 0, heatPumpMeterReading: 0, sarahSharePercent: 0,
};
const emptyBill: MonthlyBillInput = {
  sortOrder: 0, month: "", cost: 0, consumption: null, comment: null,
};

export default function Billing() {
  const { isAdmin } = useAuth();
  const [periods, setPeriods] = useState<BillingPeriod[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState<BillingPeriodInput>(emptyPeriod);

  async function load() {
    setLoading(true);
    try {
      setPeriods(await api.get<BillingPeriod[]>("/api/billing-periods"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function startAdd() {
    setForm({ ...emptyPeriod, sortOrder: (periods.at(-1)?.sortOrder ?? 0) + 1 });
    setAdding(true);
    setEditId(null);
  }
  function startEdit(p: BillingPeriod) {
    setForm({
      label: p.label, sortOrder: p.sortOrder, totalConsumptionKwh: p.totalConsumptionKwh,
      heatPumpMeterReading: p.heatPumpMeterReading, sarahSharePercent: p.sarahSharePercent,
    });
    setEditId(p.id);
    setAdding(false);
  }

  async function savePeriod() {
    try {
      if (editId) await api.put(`/api/billing-periods/${editId}`, form);
      else await api.post("/api/billing-periods", form);
      setAdding(false); setEditId(null);
      await load();
    } catch (e) { setError((e as Error).message); }
  }
  async function deletePeriod(id: number) {
    if (!confirm("Diesen Zeitraum inkl. Monatsrechnungen löschen?")) return;
    try { await api.del(`/api/billing-periods/${id}`); await load(); }
    catch (e) { setError((e as Error).message); }
  }

  if (loading) return <p className="muted">Lädt…</p>;

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>Strom / Heizung</h1>
          <p className="subtitle">Abrechnungszeiträume. Berechnete Spalten sind blau hervorgehoben.</p>
        </div>
        {isAdmin && !adding && editId === null && <button onClick={startAdd}>+ Zeitraum</button>}
      </div>
      {error && <div className="error">{error}</div>}

      {(adding || editId !== null) && (
        <PeriodForm
          value={form}
          onChange={setForm}
          onSave={savePeriod}
          onCancel={() => { setAdding(false); setEditId(null); }}
          title={editId ? "Zeitraum bearbeiten" : "Neuer Zeitraum"}
        />
      )}

      <div className="card table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Zeitraum</th>
              <th>Verbrauch Gesamt (kWh)</th>
              <th>Zählerstand Heizung</th>
              <th>Verbrauch Heizung</th>
              <th>Kosten David Gesamt</th>
              <th>Kosten Heizung gesamt</th>
              <th>Anteil Sarah</th>
              <th>Kosten David</th>
              <th>Kosten Sarah</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <Fragment key={p.id}>
                <tr>
                  <td>
                    <button className="secondary small" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                      {expanded === p.id ? "▼" : "▶"}
                    </button>{" "}
                    {p.label}
                  </td>
                  <td>{num(p.totalConsumptionKwh)}</td>
                  <td>{num(p.heatPumpMeterReading)}</td>
                  <td className="computed">{num(p.heatPumpConsumption)}</td>
                  <td className="computed">{eur(p.davidTotalCost)}</td>
                  <td className="computed">{eur(p.heatingTotalCost)}</td>
                  <td>{num(p.sarahSharePercent)} %</td>
                  <td className="computed">{eur(p.davidHeatingCost)}</td>
                  <td className="computed">{eur(p.sarahHeatingCost)}</td>
                  {isAdmin && (
                    <td>
                      <div className="row-actions">
                        <button className="secondary small" onClick={() => startEdit(p)}>✎</button>
                        <button className="danger small" onClick={() => deletePeriod(p.id)}>🗑</button>
                      </div>
                    </td>
                  )}
                </tr>
                {expanded === p.id && (
                  <tr>
                    <td colSpan={isAdmin ? 10 : 9} style={{ background: "#f8fafc" }}>
                      <BillsEditor period={p} isAdmin={isAdmin} onChanged={load} onError={setError} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function numInput(v: number, set: (n: number) => void) {
  return <input type="number" step="any" value={Number.isFinite(v) ? v : ""} onChange={(e) => set(parseFloat(e.target.value) || 0)} />;
}

function PeriodForm({
  value, onChange, onSave, onCancel, title,
}: {
  value: BillingPeriodInput;
  onChange: (v: BillingPeriodInput) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div className="form-grid">
        <div><label>Bezeichnung</label><input value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} /></div>
        <div><label>Reihenfolge</label>{numInput(value.sortOrder, (n) => onChange({ ...value, sortOrder: n }))}</div>
        <div><label>Verbrauch Gesamt (kWh)</label>{numInput(value.totalConsumptionKwh, (n) => onChange({ ...value, totalConsumptionKwh: n }))}</div>
        <div><label>Zählerstand Heizung</label>{numInput(value.heatPumpMeterReading, (n) => onChange({ ...value, heatPumpMeterReading: n }))}</div>
        <div><label>Anteil Sarah (%)</label>{numInput(value.sarahSharePercent, (n) => onChange({ ...value, sarahSharePercent: n }))}</div>
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={onSave}>Speichern</button>
        <button className="secondary" onClick={onCancel}>Abbrechen</button>
      </div>
    </div>
  );
}

function BillsEditor({
  period, isAdmin, onChanged, onError,
}: {
  period: BillingPeriod;
  isAdmin: boolean;
  onChanged: () => void;
  onError: (m: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MonthlyBillInput>(emptyBill);

  function startAdd() {
    setForm({ ...emptyBill, sortOrder: (period.monthlyBills.at(-1)?.sortOrder ?? 0) + 1 });
    setAdding(true); setEditId(null);
  }
  function startEdit(id: number) {
    const b = period.monthlyBills.find((x) => x.id === id)!;
    setForm({ sortOrder: b.sortOrder, month: b.month, cost: b.cost, consumption: b.consumption, comment: b.comment });
    setEditId(id); setAdding(false);
  }
  async function save() {
    try {
      if (editId) await api.put(`/api/billing-periods/${period.id}/bills/${editId}`, form);
      else await api.post(`/api/billing-periods/${period.id}/bills`, form);
      setAdding(false); setEditId(null); onChanged();
    } catch (e) { onError((e as Error).message); }
  }
  async function del(id: number) {
    if (!confirm("Monatsrechnung löschen?")) return;
    try { await api.del(`/api/billing-periods/${period.id}/bills/${id}`); onChanged(); }
    catch (e) { onError((e as Error).message); }
  }

  return (
    <div>
      <div className="toolbar" style={{ margin: "0.25rem 0" }}>
        <strong>Monatsrechnungen</strong>
        {isAdmin && !adding && editId === null && <button className="small" onClick={startAdd}>+ Monat</button>}
      </div>
      <table>
        <thead>
          <tr><th>Monat</th><th>Kosten</th><th>Verbrauch (kWh)</th><th>Kommentar</th>{isAdmin && <th></th>}</tr>
        </thead>
        <tbody>
          {period.monthlyBills.map((b) => (
            <tr key={b.id}>
              <td>{b.month}</td>
              <td>{eur(b.cost)}</td>
              <td>{num(b.consumption)}</td>
              <td style={{ textAlign: "left" }}>{b.comment ?? ""}</td>
              {isAdmin && (
                <td><div className="row-actions">
                  <button className="secondary small" onClick={() => startEdit(b.id)}>✎</button>
                  <button className="danger small" onClick={() => del(b.id)}>🗑</button>
                </div></td>
              )}
            </tr>
          ))}
          {period.monthlyBills.length === 0 && (
            <tr><td colSpan={isAdmin ? 5 : 4} className="muted">Keine Rechnungen.</td></tr>
          )}
        </tbody>
      </table>

      {(adding || editId !== null) && (
        <div className="card" style={{ marginTop: "0.75rem" }}>
          <div className="form-grid">
            <div><label>Monat</label><input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></div>
            <div><label>Reihenfolge</label>{numInput(form.sortOrder, (n) => setForm({ ...form, sortOrder: n }))}</div>
            <div><label>Kosten (€)</label>{numInput(form.cost, (n) => setForm({ ...form, cost: n }))}</div>
            <div><label>Verbrauch (kWh, optional)</label>
              <input type="number" step="any" value={form.consumption ?? ""} onChange={(e) => setForm({ ...form, consumption: e.target.value === "" ? null : parseFloat(e.target.value) })} />
            </div>
            <div><label>Kommentar</label><input value={form.comment ?? ""} onChange={(e) => setForm({ ...form, comment: e.target.value || null })} /></div>
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button className="small" onClick={save}>Speichern</button>
            <button className="secondary small" onClick={() => { setAdding(false); setEditId(null); }}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}
