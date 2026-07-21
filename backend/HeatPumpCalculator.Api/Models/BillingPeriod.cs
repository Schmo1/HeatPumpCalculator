namespace HeatPumpCalculator.Api.Models;

/// <summary>
/// Corresponds to a row in the Excel sheet "Abrechnung" (a billing period,
/// usually a half-year). Contains only the values entered by the admin -
/// all derived quantities (heating consumption, cost split) are computed in
/// the CalculationService.
/// </summary>
public class BillingPeriod
{
    public int Id { get; set; }

    /// <summary>Label of the period, e.g. "2024" or "2025/1".</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Order of the periods (chronologically ascending).</summary>
    public int SortOrder { get; set; }

    /// <summary>Total consumption at the main meter in kWh (heat pump + apartment 1).</summary>
    public double TotalConsumptionKwh { get; set; }

    /// <summary>Reading of the heat pump sub-meter in kWh (cumulative).</summary>
    public double HeatPumpMeterReading { get; set; }

    /// <summary>
    /// Share of apartment 2 (Sarah) in the heating costs, in percent.
    /// Usually derived from the hot water ratio (see WaterPeriod).
    /// </summary>
    public double SarahSharePercent { get; set; }

    /// <summary>Monthly bills (electricity) for this period.</summary>
    public List<MonthlyBill> MonthlyBills { get; set; } = new();
}
