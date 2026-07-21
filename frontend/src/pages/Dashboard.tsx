import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../api/client";
import { useI18n } from "../i18n/LanguageContext";
import type { BillingPeriod, WaterPeriod } from "../types";
import { eur, num } from "../utils/format";

export default function Dashboard() {
  const { t } = useI18n();
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

  if (loading) return <p className="muted">{t("common.loading")}</p>;
  if (error) return <div className="error">{error}</div>;

  const latest = billing[billing.length - 1];
  const waterRows = water.filter((w) => !w.isBaseline);

  // Chart data uses stable keys; the visible series labels come from `name`.
  const energyData = billing.map((b) => ({
    name: b.label,
    heating: b.heatPumpConsumption,
    total: b.totalConsumptionKwh,
  }));

  const costData = billing.map((b) => ({
    name: b.label,
    david: b.davidHeatingCost,
    sarah: b.sarahHeatingCost,
  }));

  const waterData = waterRows.map((w) => ({
    name: w.label,
    david: w.davidTotal ?? 0,
    sarah: w.sarahTotal ?? 0,
  }));

  const ratioData = waterRows.map((w) => ({
    name: w.label,
    hotWaterPct: w.sarahWarmRatioPercent,
    totalPct: w.sarahTotalRatioPercent,
  }));

  return (
    <>
      <h1>{t("dashboard.title")}</h1>
      <p className="subtitle">{t("dashboard.subtitle", { period: latest?.label ?? "" })}</p>

      <div className="kpi-grid">
        <div className="card kpi">
          <div className="label">{t("dashboard.kpi.totalHeating", { period: latest?.label ?? "" })}</div>
          <div className="value">{eur(latest?.heatingTotalCost)}</div>
          <div className="sub">{t("dashboard.kpi.heatingSub")}</div>
        </div>
        <div className="card kpi">
          <div className="label">{t("dashboard.kpi.ofWhichDavid")}</div>
          <div className="value" style={{ color: "var(--david)" }}>{eur(latest?.davidHeatingCost)}</div>
          <div className="sub">{num(100 - (latest?.sarahSharePercent ?? 0))} %</div>
        </div>
        <div className="card kpi">
          <div className="label">{t("dashboard.kpi.ofWhichSarah")}</div>
          <div className="value" style={{ color: "var(--sarah)" }}>{eur(latest?.sarahHeatingCost)}</div>
          <div className="sub">{num(latest?.sarahSharePercent)} %</div>
        </div>
        <div className="card kpi">
          <div className="label">{t("dashboard.kpi.heatPumpConsumption", { period: latest?.label ?? "" })}</div>
          <div className="value" style={{ color: "var(--heat)" }}>{num(latest?.heatPumpConsumption)} kWh</div>
          <div className="sub">{t("dashboard.kpi.subMeterDiff")}</div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card chart-card">
          <h3>{t("dashboard.chart.energy")}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="total" name={t("series.total")} fill="#94a3b8" />
              <Bar dataKey="heating" name={t("series.heating")} fill="var(--heat)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>{t("dashboard.chart.costSplit")}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="david" name={t("series.david")} stackId="c" fill="var(--david)" />
              <Bar dataKey="sarah" name={t("series.sarah")} stackId="c" fill="var(--sarah)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>{t("dashboard.chart.waterPerApt")}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="david" name={t("series.david")} fill="var(--david)" />
              <Bar dataKey="sarah" name={t("series.sarah")} fill="var(--sarah)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>{t("dashboard.chart.sarahWaterShare")}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ratioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="hotWaterPct" name={t("series.hotWaterPct")} stroke="var(--heat)" strokeWidth={2} />
              <Line type="monotone" dataKey="totalPct" name={t("series.totalPct")} stroke="var(--water)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
