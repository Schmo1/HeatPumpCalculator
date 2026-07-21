namespace HeatPumpCalculator.Api.Models;

/// <summary>
/// Corresponds to a row in the Excel sheet "Wasser Verbrauch".
/// Stores the recorded meter readings; consumption and ratios
/// are computed in the CalculationService from the difference to the previous period.
///
/// Note: Sarah's meters (apartment 2) count down from 100000,
/// so her consumption is computed as (previous value - current value).
/// </summary>
public class WaterPeriod
{
    public int Id { get; set; }

    /// <summary>Label, e.g. "Init" or "2025/1".</summary>
    public string Label { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    /// <summary>
    /// Baseline row (e.g. "Init"): serves only as a starting meter reading,
    /// produces no consumption of its own and does not appear in evaluations.
    /// </summary>
    public bool IsBaseline { get; set; }

    /// <summary>Total water meter reading (main meter).</summary>
    public double? TotalMeterReading { get; set; }

    /// <summary>Cold water meter reading David (apartment 1), rising.</summary>
    public double? DavidColdReading { get; set; }

    /// <summary>Hot water meter reading David (apartment 1), rising.</summary>
    public double? DavidWarmReading { get; set; }

    /// <summary>Cold water meter reading Sarah (apartment 2), falling from 100000.</summary>
    public double? SarahColdReading { get; set; }

    /// <summary>Hot water meter reading Sarah (apartment 2), falling from 100000.</summary>
    public double? SarahWarmReading { get; set; }
}
