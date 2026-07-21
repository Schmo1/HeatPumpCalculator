// Central translation dictionary. Each key exists for every supported language.
// New UI strings must be added here (not hard-coded in components).

export const LANGUAGES = ["de", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  de: "Deutsch",
  en: "English",
};

// Locale used for number/currency formatting per language.
export const LANGUAGE_LOCALES: Record<Language, string> = {
  de: "de-DE",
  en: "en-IE", // English with the euro as currency
};

type Dict = Record<string, string>;

const de: Dict = {
  // ----- common / layout -----
  "brand": "🔥 Wärmepumpe",
  "nav.overview": "Übersicht",
  "nav.billing": "Strom / Heizung",
  "nav.water": "Wasser",
  "action.signOut": "Abmelden",
  "action.save": "Speichern",
  "action.cancel": "Abbrechen",
  "common.loading": "Lädt…",
  "common.yes": "Ja",
  "common.no": "Nein",
  "field.label": "Bezeichnung",
  "field.order": "Reihenfolge",
  "period.edit": "Zeitraum bearbeiten",
  "period.new": "Neuer Zeitraum",
  "period.add": "+ Zeitraum",

  // ----- login -----
  "login.title": "🔥 Wärmepumpen-Abrechnung",
  "login.subtitle": "Bitte anmelden",
  "login.username": "Benutzername",
  "login.password": "Passwort",
  "login.signIn": "Anmelden",
  "login.signingIn": "Anmelden…",
  "login.hint": "Admin darf bearbeiten, Leser nur ansehen.",
  "login.failed": "Anmeldung fehlgeschlagen.",
  "login.invalidCredentials": "Benutzername oder Passwort ist falsch.",

  // ----- billing -----
  "billing.title": "Strom / Heizung",
  "billing.subtitle": "Abrechnungszeiträume. Berechnete Spalten sind blau hervorgehoben.",
  "billing.confirmDeletePeriod": "Diesen Zeitraum inkl. Monatsrechnungen löschen?",
  "billing.col.period": "Zeitraum",
  "billing.col.totalConsumption": "Verbrauch Gesamt (kWh)",
  "billing.col.heatingMeter": "Zählerstand Heizung",
  "billing.col.heatingConsumption": "Verbrauch Heizung",
  "billing.col.davidTotalCost": "Kosten David Gesamt",
  "billing.col.heatingTotalCost": "Kosten Heizung gesamt",
  "billing.col.sarahShare": "Anteil Sarah",
  "billing.col.davidCost": "Kosten David",
  "billing.col.sarahCost": "Kosten Sarah",
  "billing.form.sarahShare": "Anteil Sarah (%)",
  "billing.bills.title": "Monatsrechnungen",
  "billing.bills.addMonth": "+ Monat",
  "billing.bills.confirmDelete": "Monatsrechnung löschen?",
  "billing.bills.none": "Keine Rechnungen.",
  "billing.bills.col.month": "Monat",
  "billing.bills.col.cost": "Kosten",
  "billing.bills.col.consumption": "Verbrauch (kWh)",
  "billing.bills.col.comment": "Kommentar",
  "billing.bills.form.cost": "Kosten (€)",
  "billing.bills.form.consumption": "Verbrauch (kWh, optional)",

  // ----- water -----
  "water.title": "Wasser",
  "water.subtitle":
    "Zählerstände kalt/warm je Wohnung. Sarahs Zähler zählen rückwärts ab 100000. Berechnete Spalten sind blau hervorgehoben.",
  "water.confirmDelete": "Wasser-Zeitraum löschen?",
  "water.baselineOption": "Basiszeile (Init)",
  "water.baselineTag": "(Basis)",
  "water.col.period": "Zeitraum",
  "water.col.totalMeter": "Zähler gesamt",
  "water.col.totalConsumption": "Verbrauch gesamt",
  "water.col.davidCold": "David kalt",
  "water.col.davidWarm": "David warm",
  "water.col.davidTotal": "David gesamt",
  "water.col.sarahCold": "Sarah kalt",
  "water.col.sarahWarm": "Sarah warm",
  "water.col.sarahTotal": "Sarah gesamt",
  "water.col.sarahHotShare": "Warmw.-Anteil Sarah",
  "water.col.sarahTotalShare": "Gesamt-Anteil Sarah",
  "water.form.totalMeter": "Zählerstand gesamt",
  "water.form.coldDavid": "Kalt David",
  "water.form.warmDavid": "Warm David",
  "water.form.coldSarah": "Kalt Sarah",
  "water.form.warmSarah": "Warm Sarah",

  // ----- dashboard -----
  "dashboard.title": "Übersicht",
  "dashboard.subtitle":
    "Ein Hauptzähler misst Wärmepumpe + Wohnung 1 (David); die Wärmepumpe hat einen Subzähler. Wohnung 2 = Sarah. Zeitraum {period}.",
  "dashboard.kpi.totalHeating": "Heizkosten gesamt ({period})",
  "dashboard.kpi.heatingSub": "Anteil der Wärmepumpe an Davids Stromrechnung",
  "dashboard.kpi.ofWhichDavid": "davon David",
  "dashboard.kpi.ofWhichSarah": "davon Sarah",
  "dashboard.kpi.heatPumpConsumption": "Verbrauch Wärmepumpe ({period})",
  "dashboard.kpi.subMeterDiff": "Subzähler-Differenz",
  "dashboard.chart.energy": "Stromverbrauch je Zeitraum (kWh)",
  "dashboard.chart.costSplit": "Heizkosten-Aufteilung (€)",
  "dashboard.chart.waterPerApt": "Wasserverbrauch je Wohnung (m³)",
  "dashboard.chart.sarahWaterShare": "Sarahs Anteil am Wasser (%)",
  "series.heating": "Heizung",
  "series.total": "Gesamt",
  "series.david": "David",
  "series.sarah": "Sarah",
  "series.hotWaterPct": "Warmwasser %",
  "series.totalPct": "Gesamt %",
};

const en: Dict = {
  // ----- common / layout -----
  "brand": "🔥 Heat Pump",
  "nav.overview": "Overview",
  "nav.billing": "Electricity / Heating",
  "nav.water": "Water",
  "action.signOut": "Sign out",
  "action.save": "Save",
  "action.cancel": "Cancel",
  "common.loading": "Loading…",
  "common.yes": "Yes",
  "common.no": "No",
  "field.label": "Label",
  "field.order": "Order",
  "period.edit": "Edit period",
  "period.new": "New period",
  "period.add": "+ Period",

  // ----- login -----
  "login.title": "🔥 Heat Pump Billing",
  "login.subtitle": "Please sign in",
  "login.username": "Username",
  "login.password": "Password",
  "login.signIn": "Sign in",
  "login.signingIn": "Signing in…",
  "login.hint": "Admin may edit, readers can only view.",
  "login.failed": "Sign-in failed.",
  "login.invalidCredentials": "Username or password is incorrect.",

  // ----- billing -----
  "billing.title": "Electricity / Heating",
  "billing.subtitle": "Billing periods. Computed columns are highlighted in blue.",
  "billing.confirmDeletePeriod": "Delete this period including its monthly bills?",
  "billing.col.period": "Period",
  "billing.col.totalConsumption": "Total consumption (kWh)",
  "billing.col.heatingMeter": "Heating meter reading",
  "billing.col.heatingConsumption": "Heating consumption",
  "billing.col.davidTotalCost": "David total cost",
  "billing.col.heatingTotalCost": "Heating total cost",
  "billing.col.sarahShare": "Sarah's share",
  "billing.col.davidCost": "David cost",
  "billing.col.sarahCost": "Sarah cost",
  "billing.form.sarahShare": "Sarah's share (%)",
  "billing.bills.title": "Monthly bills",
  "billing.bills.addMonth": "+ Month",
  "billing.bills.confirmDelete": "Delete monthly bill?",
  "billing.bills.none": "No bills.",
  "billing.bills.col.month": "Month",
  "billing.bills.col.cost": "Cost",
  "billing.bills.col.consumption": "Consumption (kWh)",
  "billing.bills.col.comment": "Comment",
  "billing.bills.form.cost": "Cost (€)",
  "billing.bills.form.consumption": "Consumption (kWh, optional)",

  // ----- water -----
  "water.title": "Water",
  "water.subtitle":
    "Cold/hot meter readings per apartment. Sarah's meters count down from 100000. Computed columns are highlighted in blue.",
  "water.confirmDelete": "Delete water period?",
  "water.baselineOption": "Baseline row (Init)",
  "water.baselineTag": "(baseline)",
  "water.col.period": "Period",
  "water.col.totalMeter": "Total meter",
  "water.col.totalConsumption": "Total consumption",
  "water.col.davidCold": "David cold",
  "water.col.davidWarm": "David warm",
  "water.col.davidTotal": "David total",
  "water.col.sarahCold": "Sarah cold",
  "water.col.sarahWarm": "Sarah warm",
  "water.col.sarahTotal": "Sarah total",
  "water.col.sarahHotShare": "Sarah hot-water share",
  "water.col.sarahTotalShare": "Sarah total share",
  "water.form.totalMeter": "Total meter reading",
  "water.form.coldDavid": "Cold David",
  "water.form.warmDavid": "Warm David",
  "water.form.coldSarah": "Cold Sarah",
  "water.form.warmSarah": "Warm Sarah",

  // ----- dashboard -----
  "dashboard.title": "Overview",
  "dashboard.subtitle":
    "A main meter measures heat pump + apartment 1 (David); the heat pump has a sub-meter. Apartment 2 = Sarah. Period {period}.",
  "dashboard.kpi.totalHeating": "Total heating cost ({period})",
  "dashboard.kpi.heatingSub": "Heat pump's share of David's electricity bill",
  "dashboard.kpi.ofWhichDavid": "of which David",
  "dashboard.kpi.ofWhichSarah": "of which Sarah",
  "dashboard.kpi.heatPumpConsumption": "Heat pump consumption ({period})",
  "dashboard.kpi.subMeterDiff": "Sub-meter difference",
  "dashboard.chart.energy": "Electricity consumption per period (kWh)",
  "dashboard.chart.costSplit": "Heating cost split (€)",
  "dashboard.chart.waterPerApt": "Water consumption per apartment (m³)",
  "dashboard.chart.sarahWaterShare": "Sarah's water share (%)",
  "series.heating": "Heating",
  "series.total": "Total",
  "series.david": "David",
  "series.sarah": "Sarah",
  "series.hotWaterPct": "Hot water %",
  "series.totalPct": "Total %",
};

export const translations: Record<Language, Dict> = { de, en };
