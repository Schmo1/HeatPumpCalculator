namespace HeatPumpCalculator.Api.Models;

/// <summary>
/// Entspricht einer Zeile im Excel-Blatt "Abrechnung" (ein Abrechnungszeitraum,
/// i.d.R. ein Halbjahr). Enthält nur die vom Admin eingegebenen Werte -
/// alle abgeleiteten Größen (Verbrauch Heizung, Kostenaufteilung) werden im
/// CalculationService berechnet.
/// </summary>
public class BillingPeriod
{
    public int Id { get; set; }

    /// <summary>Bezeichnung des Zeitraums, z.B. "2024" oder "2025/1".</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Reihenfolge der Zeiträume (chronologisch aufsteigend).</summary>
    public int SortOrder { get; set; }

    /// <summary>Verbrauch Gesamt am Hauptzähler in kWh (Wärmepumpe + Wohnung 1).</summary>
    public double TotalConsumptionKwh { get; set; }

    /// <summary>Zählerstand des Wärmepumpen-Subzählers in kWh (kumuliert).</summary>
    public double HeatPumpMeterReading { get; set; }

    /// <summary>
    /// Anteil von Wohnung 2 (Sarah) an den Heizkosten in Prozent.
    /// Stammt i.d.R. aus dem Warmwasser-Verhältnis (siehe WaterPeriod).
    /// </summary>
    public double SarahSharePercent { get; set; }

    /// <summary>Monatsrechnungen (Strom) für diesen Zeitraum.</summary>
    public List<MonthlyBill> MonthlyBills { get; set; } = new();
}
