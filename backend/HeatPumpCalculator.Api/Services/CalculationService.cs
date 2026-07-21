using HeatPumpCalculator.Api.Data;
using HeatPumpCalculator.Api.Dtos;
using HeatPumpCalculator.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HeatPumpCalculator.Api.Services;

/// <summary>
/// Bildet die Rechenlogik der ursprünglichen Excel-Datei nach.
/// Die Entitäten speichern nur Eingabewerte; sämtliche abgeleiteten Größen
/// (Verbrauch Heizung, Kostenaufteilung, Wasserverbräuche, Verhältnisse)
/// werden hier aus den gespeicherten Zählerständen berechnet.
/// </summary>
public class CalculationService
{
    private readonly AppDbContext _db;

    public CalculationService(AppDbContext db) => _db = db;

    // ---------- Abrechnung (Strom / Heizung) ----------

    public async Task<List<BillingPeriodDto>> GetBillingPeriodsAsync()
    {
        var periods = await _db.BillingPeriods
            .Include(p => p.MonthlyBills)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        var result = new List<BillingPeriodDto>();
        double previousReading = 0; // erster Zeitraum rechnet gegen 0

        foreach (var p in periods)
        {
            result.Add(Compute(p, previousReading));
            previousReading = p.HeatPumpMeterReading;
        }

        return result;
    }

    public async Task<BillingPeriodDto?> GetBillingPeriodAsync(int id)
    {
        // Für korrekte Differenz-Berechnung wird der Vorzeitraum benötigt.
        var all = await GetBillingPeriodsAsync();
        return all.FirstOrDefault(p => p.Id == id);
    }

    private static BillingPeriodDto Compute(BillingPeriod p, double previousReading)
    {
        // Verbrauch Heizung = Zählerstand - Vorzählerstand (Subzähler Wärmepumpe)
        double heatPumpConsumption = p.HeatPumpMeterReading - previousReading;

        // Kosten David Gesamt = Summe der Monatsrechnungen
        double davidTotalCost = p.MonthlyBills.Sum(b => b.Cost);

        // Kosten gesamt Heizung = DavidGesamt / VerbrauchGesamt * VerbrauchHeizung
        double heatingTotalCost = p.TotalConsumptionKwh != 0
            ? davidTotalCost / p.TotalConsumptionKwh * heatPumpConsumption
            : 0;

        // Aufteilung: David zahlt (100 - Anteil Sarah)%, Sarah zahlt Anteil Sarah%
        double davidHeatingCost = heatingTotalCost * (100 - p.SarahSharePercent) / 100;
        double sarahHeatingCost = heatingTotalCost * p.SarahSharePercent / 100;

        var bills = p.MonthlyBills
            .OrderBy(b => b.SortOrder)
            .Select(b => new MonthlyBillDto(b.Id, b.SortOrder, b.Month, b.Cost, b.Consumption, b.Comment))
            .ToList();

        return new BillingPeriodDto(
            p.Id, p.Label, p.SortOrder,
            p.TotalConsumptionKwh, p.HeatPumpMeterReading,
            Round(heatPumpConsumption),
            Round(davidTotalCost),
            Round(heatingTotalCost),
            p.SarahSharePercent,
            Round(davidHeatingCost),
            Round(sarahHeatingCost),
            bills);
    }

    // ---------- Wasser ----------

    public async Task<List<WaterPeriodDto>> GetWaterPeriodsAsync()
    {
        var periods = await _db.WaterPeriods
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        var result = new List<WaterPeriodDto>();
        WaterPeriod? prev = null;

        foreach (var p in periods)
        {
            result.Add(ComputeWater(p, prev));
            prev = p;
        }

        return result;
    }

    public async Task<WaterPeriodDto?> GetWaterPeriodAsync(int id)
    {
        var all = await GetWaterPeriodsAsync();
        return all.FirstOrDefault(p => p.Id == id);
    }

    private static WaterPeriodDto ComputeWater(WaterPeriod p, WaterPeriod? prev)
    {
        // Basiszeile oder fehlender Vorzeitraum -> keine Verbräuche
        if (p.IsBaseline || prev is null)
        {
            return new WaterPeriodDto(
                p.Id, p.Label, p.SortOrder, p.IsBaseline,
                p.TotalMeterReading, p.DavidColdReading, p.DavidWarmReading,
                p.SarahColdReading, p.SarahWarmReading,
                null, null, null, null, null, null, null, null, null);
        }

        // David: steigende Zähler -> aktuell - vorher
        double? davidCold = Diff(p.DavidColdReading, prev.DavidColdReading);
        double? davidWarm = Diff(p.DavidWarmReading, prev.DavidWarmReading);
        double? davidTotal = Add(davidCold, davidWarm);

        // Sarah: fallende Zähler ab 100000 -> vorher - aktuell
        double? sarahCold = Diff(prev.SarahColdReading, p.SarahColdReading);
        double? sarahWarm = Diff(prev.SarahWarmReading, p.SarahWarmReading);
        double? sarahTotal = Add(sarahCold, sarahWarm);

        double? totalConsumption = Diff(p.TotalMeterReading, prev.TotalMeterReading);

        double? warmSum = Add(davidWarm, sarahWarm);
        double? sarahWarmRatio = (warmSum is > 0 && sarahWarm.HasValue)
            ? 100.0 / warmSum.Value * sarahWarm.Value : null;

        double? totalSum = Add(davidTotal, sarahTotal);
        double? sarahTotalRatio = (totalSum is > 0 && sarahTotal.HasValue)
            ? 100.0 / totalSum.Value * sarahTotal.Value : null;

        return new WaterPeriodDto(
            p.Id, p.Label, p.SortOrder, p.IsBaseline,
            p.TotalMeterReading, p.DavidColdReading, p.DavidWarmReading,
            p.SarahColdReading, p.SarahWarmReading,
            Round(totalConsumption), Round(davidCold), Round(davidWarm), Round(davidTotal),
            Round(sarahCold), Round(sarahWarm), Round(sarahTotal),
            Round(sarahWarmRatio), Round(sarahTotalRatio));
    }

    // ---------- Hilfsfunktionen ----------

    private static double? Diff(double? a, double? b)
        => (a.HasValue && b.HasValue) ? a.Value - b.Value : null;

    private static double? Add(double? a, double? b)
        => (a.HasValue && b.HasValue) ? a.Value + b.Value : null;

    private static double Round(double v) => Math.Round(v, 2);
    private static double? Round(double? v) => v.HasValue ? Math.Round(v.Value, 2) : null;
}
