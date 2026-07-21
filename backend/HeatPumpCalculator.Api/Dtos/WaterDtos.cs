namespace HeatPumpCalculator.Api.Dtos;

/// <summary>Water period including computed consumption and ratios – output.</summary>
public record WaterPeriodDto(
    int Id,
    string Label,
    int SortOrder,
    bool IsBaseline,
    // meter readings (input):
    double? TotalMeterReading,
    double? DavidColdReading,
    double? DavidWarmReading,
    double? SarahColdReading,
    double? SarahWarmReading,
    // computed:
    double? TotalConsumption,
    double? DavidCold,
    double? DavidWarm,
    double? DavidTotal,
    double? SarahCold,
    double? SarahWarm,
    double? SarahTotal,
    double? SarahWarmRatioPercent,
    double? SarahTotalRatioPercent);

/// <summary>Water period – input.</summary>
public record WaterPeriodInputDto(
    string Label,
    int SortOrder,
    bool IsBaseline,
    double? TotalMeterReading,
    double? DavidColdReading,
    double? DavidWarmReading,
    double? SarahColdReading,
    double? SarahWarmReading);
