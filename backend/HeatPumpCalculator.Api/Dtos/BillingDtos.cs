namespace HeatPumpCalculator.Api.Dtos;

/// <summary>Monthly bill – output.</summary>
public record MonthlyBillDto(
    int Id,
    int SortOrder,
    string Month,
    double Cost,
    double? Consumption,
    string? Comment);

/// <summary>Monthly bill – input (create/update).</summary>
public record MonthlyBillInputDto(
    int SortOrder,
    string Month,
    double Cost,
    double? Consumption,
    string? Comment);

/// <summary>Billing period including all computed values – output.</summary>
public record BillingPeriodDto(
    int Id,
    string Label,
    int SortOrder,
    double TotalConsumptionKwh,
    double HeatPumpMeterReading,
    // computed:
    double HeatPumpConsumption,
    double DavidTotalCost,
    double HeatingTotalCost,
    double SarahSharePercent,
    double DavidHeatingCost,
    double SarahHeatingCost,
    List<MonthlyBillDto> MonthlyBills);

/// <summary>Billing period – input (only the entered fields).</summary>
public record BillingPeriodInputDto(
    string Label,
    int SortOrder,
    double TotalConsumptionKwh,
    double HeatPumpMeterReading,
    double SarahSharePercent);
