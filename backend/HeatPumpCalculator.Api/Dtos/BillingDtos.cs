namespace HeatPumpCalculator.Api.Dtos;

/// <summary>Monatsrechnung – Ausgabe.</summary>
public record MonthlyBillDto(
    int Id,
    int SortOrder,
    string Month,
    double Cost,
    double? Consumption,
    string? Comment);

/// <summary>Monatsrechnung – Eingabe (Anlegen/Ändern).</summary>
public record MonthlyBillInputDto(
    int SortOrder,
    string Month,
    double Cost,
    double? Consumption,
    string? Comment);

/// <summary>Abrechnungszeitraum inkl. aller berechneten Werte – Ausgabe.</summary>
public record BillingPeriodDto(
    int Id,
    string Label,
    int SortOrder,
    double TotalConsumptionKwh,
    double HeatPumpMeterReading,
    // berechnet:
    double HeatPumpConsumption,
    double DavidTotalCost,
    double HeatingTotalCost,
    double SarahSharePercent,
    double DavidHeatingCost,
    double SarahHeatingCost,
    List<MonthlyBillDto> MonthlyBills);

/// <summary>Abrechnungszeitraum – Eingabe (nur die eingegebenen Felder).</summary>
public record BillingPeriodInputDto(
    string Label,
    int SortOrder,
    double TotalConsumptionKwh,
    double HeatPumpMeterReading,
    double SarahSharePercent);
