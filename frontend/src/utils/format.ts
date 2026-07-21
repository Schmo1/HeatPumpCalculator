const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
const cf = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function num(v: number | null | undefined): string {
  return v === null || v === undefined ? "–" : nf.format(v);
}

export function eur(v: number | null | undefined): string {
  return v === null || v === undefined ? "–" : cf.format(v);
}

export function pct(v: number | null | undefined): string {
  return v === null || v === undefined ? "–" : `${nf.format(v)} %`;
}
