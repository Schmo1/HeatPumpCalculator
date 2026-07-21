// Number/currency formatting. The locale follows the selected UI language and is
// updated via setFormatLocale() by the LanguageProvider. Currency stays EUR.

let locale = "de-DE";
let nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
let cf = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });

export function setFormatLocale(next: string): void {
  if (next === locale) {
    return;
  }
  locale = next;
  nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  cf = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
}

export function num(v: number | null | undefined): string {
  return v === null || v === undefined ? "–" : nf.format(v);
}

export function eur(v: number | null | undefined): string {
  return v === null || v === undefined ? "–" : cf.format(v);
}

export function pct(v: number | null | undefined): string {
  return v === null || v === undefined ? "–" : `${nf.format(v)} %`;
}
