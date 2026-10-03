import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../api/client";
import { useI18n } from "../i18n/LanguageContext";
import type { BillingPeriod, WaterPeriod } from "../types";
import { eur, num } from "../utils/format";

// Identity rides the legend swatch, never the label text.
const legendLabel = (value: string) => <span style={{ color: "var(--text-secondary)" }}>{value}</span>;

const axisTick = { fill: "var(--muted)", fontSize: 12 };
const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  boxShadow: "0 6px 16px rgba(26, 26, 24, 0.08)",
  fontSize: 12,
};
const legendStyle = { fontSize: 12, paddingTop: 10 };
const barCursor = { fill: "rgba(26, 26, 24, 0.04)" };

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
          <div className="label">
            <span className="dot" style={{ background: "var(--david)" }} />
            {t("dashboard.kpi.ofWhichDavid")}
          </div>
          <div className="value">{eur(latest?.davidHeatingCost)}</div>
          <div className="sub">{num(100 - (latest?.sarahSharePercent ?? 0))} %</div>
        </div>
        <div className="card kpi">
          <div className="label">
            <span className="dot" style={{ background: "var(--sarah)" }} />
            {t("dashboard.kpi.ofWhichSarah")}
          </div>
          <div className="value">{eur(latest?.sarahHeatingCost)}</div>
          <div className="sub">{num(latest?.sarahSharePercent)} %</div>
        </div>
        <div className="card kpi">
          <div className="label">
            <span className="dot" style={{ background: "var(--energy-heating)" }} />
            {t("dashboard.kpi.heatPumpConsumption", { period: latest?.label ?? "" })}
          </div>
          <div className="value">{num(latest?.heatPumpConsumption)} kWh</div>
          <div className="sub">{t("dashboard.kpi.subMeterDiff")}</div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: "1.25rem" }}>
        <div className="card chart-card">
          <h3>{t("dashboard.chart.energy")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={energyData} barGap={2}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={56} tickFormatter={num} />
              <Tooltip contentStyle={tooltipStyle} cursor={barCursor} />
              <Legend wrapperStyle={legendStyle} formatter={legendLabel} />
              <Bar dataKey="total" name={t("series.total")} fill="var(--energy-total)" maxBarSize={24} radius={[4, 4, 0, 0]} />
              <Bar dataKey="heating" name={t("series.heating")} fill="var(--energy-heating)" maxBarSize={24} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>{t("dashboard.chart.costSplit")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={costData}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={56} tickFormatter={num} />
              <Tooltip contentStyle={tooltipStyle} cursor={barCursor} />
              <Legend wrapperStyle={legendStyle} formatter={legendLabel} />
              <Bar
                dataKey="david" name={t("series.david")} stackId="c" fill="var(--david)"
                maxBarSize={24} stroke="var(--surface)" strokeWidth={2}
              />
              <Bar
                dataKey="sarah" name={t("series.sarah")} stackId="c" fill="var(--sarah)"
                maxBarSize={24} stroke="var(--surface)" strokeWidth={2} radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>{t("dashboard.chart.waterPerApt")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={waterData} barGap={2}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={56} tickFormatter={num} />
              <Tooltip contentStyle={tooltipStyle} cursor={barCursor} />
              <Legend wrapperStyle={legendStyle} formatter={legendLabel} />
              <Bar dataKey="david" name={t("series.david")} fill="var(--david)" maxBarSize={24} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sarah" name={t("series.sarah")} fill="var(--sarah)" maxBarSize={24} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>{t("dashboard.chart.sarahWaterShare")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ratioData}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
              <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} width={52} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
              <Legend wrapperStyle={legendStyle} formatter={legendLabel} />
              <Line
                type="monotone" dataKey="hotWaterPct" name={t("series.hotWaterPct")}
                stroke="var(--share-warm)" strokeWidth={2} strokeLinecap="round"
                dot={{ r: 4, fill: "var(--share-warm)", stroke: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--share-warm)", stroke: "var(--surface)", strokeWidth: 2 }}
              />
              <Line
                type="monotone" dataKey="totalPct" name={t("series.totalPct")}
                stroke="var(--share-total)" strokeWidth={2} strokeLinecap="round"
                dot={{ r: 4, fill: "var(--share-total)", stroke: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--share-total)", stroke: "var(--surface)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
