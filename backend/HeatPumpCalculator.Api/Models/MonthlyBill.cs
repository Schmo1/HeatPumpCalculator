namespace HeatPumpCalculator.Api.Models;

/// <summary>
/// A single monthly bill (electricity) within a billing period.
/// Corresponds to a row in the Excel sheets "Kosten YYYY".
/// </summary>
public class MonthlyBill
{
    public int Id { get; set; }

    public int BillingPeriodId { get; set; }
    public BillingPeriod? BillingPeriod { get; set; }

    /// <summary>Order within the period.</summary>
    public int SortOrder { get; set; }

    /// <summary>Month label, e.g. "January".</summary>
    public string Month { get; set; } = string.Empty;

    /// <summary>Bill amount in euros.</summary>
    public double Cost { get; set; }

    /// <summary>Optional electricity consumption for this month in kWh.</summary>
    public double? Consumption { get; set; }

    /// <summary>Optional comment.</summary>
    public string? Comment { get; set; }
}
