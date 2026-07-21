namespace HeatPumpCalculator.Api.Dtos;

/// <summary>Wasser-Zeitraum inkl. berechneter Verbräuche und Verhältnisse – Ausgabe.</summary>
public record WaterPeriodDto(
    int Id,
    string Label,
    int SortOrder,
    bool IsBaseline,
    // Zählerstände (Eingabe):
    double? TotalMeterReading,
    double? DavidColdReading,
    double? DavidWarmReading,
    double? SarahColdReading,
    double? SarahWarmReading,
    // berechnet:
    double? TotalConsumption,
    double? DavidCold,
    double? DavidWarm,
    double? DavidTotal,
    double? SarahCold,
    double? SarahWarm,
    double? SarahTotal,
    double? SarahWarmRatioPercent,
    double? SarahTotalRatioPercent);

/// <summary>Wasser-Zeitraum – Eingabe.</summary>
public record WaterPeriodInputDto(
    string Label,
    int SortOrder,
    bool IsBaseline,
    double? TotalMeterReading,
    double? DavidColdReading,
    double? DavidWarmReading,
    double? SarahColdReading,
    double? SarahWarmReading);
