using HeatPumpCalculator.Api.Data;
using HeatPumpCalculator.Api.Dtos;
using HeatPumpCalculator.Api.Models;
using HeatPumpCalculator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeatPumpCalculator.Api.Controllers;

[ApiController]
[Route("api/billing-periods")]
[Authorize] // Lesen: jeder angemeldete Nutzer
public class BillingPeriodsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly CalculationService _calc;

    public BillingPeriodsController(AppDbContext db, CalculationService calc)
    {
        _db = db;
        _calc = calc;
    }

    [HttpGet]
    public async Task<ActionResult<List<BillingPeriodDto>>> GetAll()
        => await _calc.GetBillingPeriodsAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BillingPeriodDto>> Get(int id)
    {
        var dto = await _calc.GetBillingPeriodAsync(id);
        return dto is null ? NotFound() : dto;
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<BillingPeriodDto>> Create(BillingPeriodInputDto input)
    {
        var entity = new BillingPeriod
        {
            Label = input.Label,
            SortOrder = input.SortOrder,
            TotalConsumptionKwh = input.TotalConsumptionKwh,
            HeatPumpMeterReading = input.HeatPumpMeterReading,
            SarahSharePercent = input.SarahSharePercent,
        };
        _db.BillingPeriods.Add(entity);
        await _db.SaveChangesAsync();

        var dto = await _calc.GetBillingPeriodAsync(entity.Id);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<BillingPeriodDto>> Update(int id, BillingPeriodInputDto input)
    {
        var entity = await _db.BillingPeriods.FindAsync(id);
        if (entity is null) return NotFound();

        entity.Label = input.Label;
        entity.SortOrder = input.SortOrder;
        entity.TotalConsumptionKwh = input.TotalConsumptionKwh;
        entity.HeatPumpMeterReading = input.HeatPumpMeterReading;
        entity.SarahSharePercent = input.SarahSharePercent;
        await _db.SaveChangesAsync();

        return await _calc.GetBillingPeriodAsync(id) is { } dto ? dto : NotFound();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.BillingPeriods.FindAsync(id);
        if (entity is null) return NotFound();
        _db.BillingPeriods.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ---------- Monatsrechnungen (verschachtelt) ----------

    [HttpPost("{id:int}/bills")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<BillingPeriodDto>> AddBill(int id, MonthlyBillInputDto input)
    {
        var period = await _db.BillingPeriods.FindAsync(id);
        if (period is null) return NotFound();

        _db.MonthlyBills.Add(new MonthlyBill
        {
            BillingPeriodId = id,
            SortOrder = input.SortOrder,
            Month = input.Month,
            Cost = input.Cost,
            Consumption = input.Consumption,
            Comment = input.Comment,
        });
        await _db.SaveChangesAsync();
        return await _calc.GetBillingPeriodAsync(id) is { } dto ? dto : NotFound();
    }

    [HttpPut("{id:int}/bills/{billId:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<BillingPeriodDto>> UpdateBill(int id, int billId, MonthlyBillInputDto input)
    {
        var bill = await _db.MonthlyBills.FirstOrDefaultAsync(b => b.Id == billId && b.BillingPeriodId == id);
        if (bill is null) return NotFound();

        bill.SortOrder = input.SortOrder;
        bill.Month = input.Month;
        bill.Cost = input.Cost;
        bill.Consumption = input.Consumption;
        bill.Comment = input.Comment;
        await _db.SaveChangesAsync();
        return await _calc.GetBillingPeriodAsync(id) is { } dto ? dto : NotFound();
    }

    [HttpDelete("{id:int}/bills/{billId:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeleteBill(int id, int billId)
    {
        var bill = await _db.MonthlyBills.FirstOrDefaultAsync(b => b.Id == billId && b.BillingPeriodId == id);
        if (bill is null) return NotFound();
        _db.MonthlyBills.Remove(bill);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
