import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../api/client";
import type { BillingPeriod, WaterPeriod } from "../types";
import { eur, num } from "../utils/format";

export default function Dashboard() {
  const [billing, setBilling] = useState<BillingPeriod[]>([]);
  const [water, setWater] = useState<WaterPeriod[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<BillingPeriod[]>("/api/billing-periods"),
      api.get<WaterPeriod[]>("/api/water-periods"),
    ])
      .then(([b, w]) => { setBilling(b); setWater(w); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Lädt…</p>;
  if (error) return <div className="error">{error}</div>;

  const latest = billing[billing.length - 1];
  const waterRows = water.filter((w) => !w.isBaseline);

  const energyData = billing.map((b) => ({
    name: b.label,
    Heizung: b.heatPumpConsumption,
    Gesamt: b.totalConsumptionKwh,
  }));

  const costData = billing.map((b) => ({
    name: b.label,
    David: b.davidHeatingCost,
    Sarah: b.sarahHeatingCost,
  }));

  const waterData = waterRows.map((w) => ({
    name: w.label,
    David: w.davidTotal ?? 0,
    Sarah: w.sarahTotal ?? 0,
  }));

  const ratioData = waterRows.map((w) => ({
    name: w.label,
    "Warmwasser %": w.sarahWarmRatioPercent,
    "Gesamt %": w.sarahTotalRatioPercent,
  }));

  return (
    <>
      <h1>Übersicht</h1>
      <p className="subtitle">
        Ein Hauptzähler misst Wärmepumpe + Wohnung 1 (David); die Wärmepumpe hat einen Subzähler.
        Wohnung 2 = Sarah. Zeitraum {latest?.label}.
      </p>

      <div className="kpi-grid">
        <div className="card kpi">
          <div className="label">Heizkosten gesamt ({latest?.label})</div>
          <div className="value">{eur(latest?.heatingTotalCost)}</div>
          <div className="sub">Anteil der Wärmepumpe an Davids Stromrechnung</div>
        </div>
        <div className="card kpi">
          <div className="label">davon David</div>
          <div className="value" style={{ color: "var(--david)" }}>{eur(latest?.davidHeatingCost)}</div>
          <div className="sub">{num(100 - (latest?.sarahSharePercent ?? 0))} %</div>
        </div>
        <div className="card kpi">
          <div className="label">davon Sarah</div>
          <div className="value" style={{ color: "var(--sarah)" }}>{eur(latest?.sarahHeatingCost)}</div>
          <div className="sub">{num(latest?.sarahSharePercent)} %</div>
        </div>
        <div className="card kpi">
          <div className="label">Verbrauch Wärmepumpe ({latest?.label})</div>
          <div className="value" style={{ color: "var(--heat)" }}>{num(latest?.heatPumpConsumption)} kWh</div>
          <div className="sub">Subzähler-Differenz</div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card chart-card">
          <h3>Stromverbrauch je Zeitraum (kWh)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="Gesamt" fill="#94a3b8" />
              <Bar dataKey="Heizung" fill="var(--heat)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Heizkosten-Aufteilung (€)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="David" stackId="c" fill="var(--david)" />
              <Bar dataKey="Sarah" stackId="c" fill="var(--sarah)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Wasserverbrauch je Wohnung (m³)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="David" fill="var(--david)" />
              <Bar dataKey="Sarah" fill="var(--sarah)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Sarahs Anteil am Wasser (%)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ratioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="Warmwasser %" stroke="var(--heat)" strokeWidth={2} />
              <Line type="monotone" dataKey="Gesamt %" stroke="var(--water)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
