import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import type { WaterPeriod, WaterPeriodInput } from "../types";
import { num, pct } from "../utils/format";

const empty: WaterPeriodInput = {
  label: "", sortOrder: 0, isBaseline: false,
  totalMeterReading: null, davidColdReading: null, davidWarmReading: null,
  sarahColdReading: null, sarahWarmReading: null,
};

export default function Water() {
  const { isAdmin } = useAuth();
  const { t } = useI18n();
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
    if (!confirm(t("water.confirmDelete"))) return;
    try { await api.del(`/api/water-periods/${id}`); await load(); }
    catch (e) { setError((e as Error).message); }
  }

  if (loading) return <p className="muted">{t("common.loading")}</p>;

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>{t("water.title")}</h1>
          <p className="subtitle">{t("water.subtitle")}</p>
        </div>
        {isAdmin && !adding && editId === null && <button onClick={startAdd}>{t("period.add")}</button>}
      </div>
      {error && <div className="error">{error}</div>}

      {(adding || editId !== null) && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{editId ? t("period.edit") : t("period.new")}</h3>
          <div className="form-grid">
            <div><label>{t("field.label")}</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
            <div><label>{t("field.order")}</label><input type="number" step="any" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseFloat(e.target.value) || 0 })} /></div>
            <div>
              <label>{t("water.baselineOption")}</label>
              <select value={form.isBaseline ? "1" : "0"} onChange={(e) => setForm({ ...form, isBaseline: e.target.value === "1" })}>
                <option value="0">{t("common.no")}</option>
                <option value="1">{t("common.yes")}</option>
              </select>
            </div>
            <NumField label={t("water.form.totalMeter")} v={form.totalMeterReading} set={(n) => setForm({ ...form, totalMeterReading: n })} />
            <NumField label={t("water.form.coldDavid")} v={form.davidColdReading} set={(n) => setForm({ ...form, davidColdReading: n })} />
            <NumField label={t("water.form.warmDavid")} v={form.davidWarmReading} set={(n) => setForm({ ...form, davidWarmReading: n })} />
            <NumField label={t("water.form.coldSarah")} v={form.sarahColdReading} set={(n) => setForm({ ...form, sarahColdReading: n })} />
            <NumField label={t("water.form.warmSarah")} v={form.sarahWarmReading} set={(n) => setForm({ ...form, sarahWarmReading: n })} />
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button onClick={save}>{t("action.save")}</button>
            <button className="secondary" onClick={() => { setAdding(false); setEditId(null); }}>{t("action.cancel")}</button>
          </div>
        </div>
      )}

      <div className="card table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>{t("water.col.period")}</th>
              <th>{t("water.col.totalMeter")}</th>
              <th>{t("water.col.totalConsumption")}</th>
              <th>{t("water.col.davidCold")}</th><th>{t("water.col.davidWarm")}</th><th>{t("water.col.davidTotal")}</th>
              <th>{t("water.col.sarahCold")}</th><th>{t("water.col.sarahWarm")}</th><th>{t("water.col.sarahTotal")}</th>
              <th>{t("water.col.sarahHotShare")}</th><th>{t("water.col.sarahTotalShare")}</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} style={w.isBaseline ? { color: "var(--muted)" } : undefined}>
                <td>{w.label}{w.isBaseline && ` ${t("water.baselineTag")}`}</td>
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
