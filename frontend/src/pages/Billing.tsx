import { Fragment, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
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
  const { t } = useI18n();
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
    if (!confirm(t("billing.confirmDeletePeriod"))) return;
    try { await api.del(`/api/billing-periods/${id}`); await load(); }
    catch (e) { setError((e as Error).message); }
  }

  if (loading) return <p className="muted">{t("common.loading")}</p>;

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>{t("billing.title")}</h1>
          <p className="subtitle">{t("billing.subtitle")}</p>
        </div>
        {isAdmin && !adding && editId === null && <button onClick={startAdd}>{t("period.add")}</button>}
      </div>
      {error && <div className="error">{error}</div>}

      {(adding || editId !== null) && (
        <PeriodForm
          value={form}
          onChange={setForm}
          onSave={savePeriod}
          onCancel={() => { setAdding(false); setEditId(null); }}
          title={editId ? t("period.edit") : t("period.new")}
        />
      )}

      <div className="card table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>{t("billing.col.period")}</th>
              <th>{t("billing.col.totalConsumption")}</th>
              <th>{t("billing.col.heatingMeter")}</th>
              <th>{t("billing.col.heatingConsumption")}</th>
              <th>{t("billing.col.davidTotalCost")}</th>
              <th>{t("billing.col.heatingTotalCost")}</th>
              <th>{t("billing.col.sarahShare")}</th>
              <th>{t("billing.col.davidCost")}</th>
              <th>{t("billing.col.sarahCost")}</th>
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
  const { t } = useI18n();
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div className="form-grid">
        <div><label>{t("field.label")}</label><input value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} /></div>
        <div><label>{t("field.order")}</label>{numInput(value.sortOrder, (n) => onChange({ ...value, sortOrder: n }))}</div>
        <div><label>{t("billing.col.totalConsumption")}</label>{numInput(value.totalConsumptionKwh, (n) => onChange({ ...value, totalConsumptionKwh: n }))}</div>
        <div><label>{t("billing.col.heatingMeter")}</label>{numInput(value.heatPumpMeterReading, (n) => onChange({ ...value, heatPumpMeterReading: n }))}</div>
        <div><label>{t("billing.form.sarahShare")}</label>{numInput(value.sarahSharePercent, (n) => onChange({ ...value, sarahSharePercent: n }))}</div>
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={onSave}>{t("action.save")}</button>
        <button className="secondary" onClick={onCancel}>{t("action.cancel")}</button>
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
  const { t } = useI18n();
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
    if (!confirm(t("billing.bills.confirmDelete"))) return;
    try { await api.del(`/api/billing-periods/${period.id}/bills/${id}`); onChanged(); }
    catch (e) { onError((e as Error).message); }
  }

  return (
    <div>
      <div className="toolbar" style={{ margin: "0.25rem 0" }}>
        <strong>{t("billing.bills.title")}</strong>
        {isAdmin && !adding && editId === null && <button className="small" onClick={startAdd}>{t("billing.bills.addMonth")}</button>}
      </div>
      <table>
        <thead>
          <tr><th>{t("billing.bills.col.month")}</th><th>{t("billing.bills.col.cost")}</th><th>{t("billing.bills.col.consumption")}</th><th>{t("billing.bills.col.comment")}</th>{isAdmin && <th></th>}</tr>
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
            <tr><td colSpan={isAdmin ? 5 : 4} className="muted">{t("billing.bills.none")}</td></tr>
          )}
        </tbody>
      </table>

      {(adding || editId !== null) && (
        <div className="card" style={{ marginTop: "0.75rem" }}>
          <div className="form-grid">
            <div><label>{t("billing.bills.col.month")}</label><input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></div>
            <div><label>{t("field.order")}</label>{numInput(form.sortOrder, (n) => setForm({ ...form, sortOrder: n }))}</div>
            <div><label>{t("billing.bills.form.cost")}</label>{numInput(form.cost, (n) => setForm({ ...form, cost: n }))}</div>
            <div><label>{t("billing.bills.form.consumption")}</label>
              <input type="number" step="any" value={form.consumption ?? ""} onChange={(e) => setForm({ ...form, consumption: e.target.value === "" ? null : parseFloat(e.target.value) })} />
            </div>
            <div><label>{t("billing.bills.col.comment")}</label><input value={form.comment ?? ""} onChange={(e) => setForm({ ...form, comment: e.target.value || null })} /></div>
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button className="small" onClick={save}>{t("action.save")}</button>
            <button className="secondary small" onClick={() => { setAdding(false); setEditId(null); }}>{t("action.cancel")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
