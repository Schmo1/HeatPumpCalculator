namespace HeatPumpCalculator.Api.Models;

/// <summary>
/// Eine einzelne Monatsrechnung (Strom) innerhalb eines Abrechnungszeitraums.
/// Entspricht einer Zeile in den Excel-Blättern "Kosten YYYY".
/// </summary>
public class MonthlyBill
{
    public int Id { get; set; }

    public int BillingPeriodId { get; set; }
    public BillingPeriod? BillingPeriod { get; set; }

    /// <summary>Reihenfolge innerhalb des Zeitraums.</summary>
    public int SortOrder { get; set; }

    /// <summary>Monatsbezeichnung, z.B. "Januar".</summary>
    public string Month { get; set; } = string.Empty;

    /// <summary>Rechnungsbetrag in Euro.</summary>
    public double Cost { get; set; }

    /// <summary>Optionaler Stromverbrauch dieses Monats in kWh.</summary>
    public double? Consumption { get; set; }

    /// <summary>Optionaler Kommentar.</summary>
    public string? Comment { get; set; }
}
