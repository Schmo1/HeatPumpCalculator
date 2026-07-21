using HeatPumpCalculator.Api.Data;
using HeatPumpCalculator.Api.Dtos;
using HeatPumpCalculator.Api.Models;
using HeatPumpCalculator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeatPumpCalculator.Api.Controllers;

[ApiController]
[Route("api/water-periods")]
[Authorize]
public class WaterPeriodsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly CalculationService _calc;

    public WaterPeriodsController(AppDbContext db, CalculationService calc)
    {
        _db = db;
        _calc = calc;
    }

    [HttpGet]
    public async Task<ActionResult<List<WaterPeriodDto>>> GetAll()
        => await _calc.GetWaterPeriodsAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WaterPeriodDto>> Get(int id)
    {
        var dto = await _calc.GetWaterPeriodAsync(id);
        return dto is null ? NotFound() : dto;
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<WaterPeriodDto>> Create(WaterPeriodInputDto input)
    {
        var entity = Map(new WaterPeriod(), input);
        _db.WaterPeriods.Add(entity);
        await _db.SaveChangesAsync();
        var dto = await _calc.GetWaterPeriodAsync(entity.Id);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<WaterPeriodDto>> Update(int id, WaterPeriodInputDto input)
    {
        var entity = await _db.WaterPeriods.FindAsync(id);
        if (entity is null) return NotFound();
        Map(entity, input);
        await _db.SaveChangesAsync();
        return await _calc.GetWaterPeriodAsync(id) is { } dto ? dto : NotFound();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.WaterPeriods.FindAsync(id);
        if (entity is null) return NotFound();
        _db.WaterPeriods.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static WaterPeriod Map(WaterPeriod entity, WaterPeriodInputDto input)
    {
        entity.Label = input.Label;
        entity.SortOrder = input.SortOrder;
        entity.IsBaseline = input.IsBaseline;
        entity.TotalMeterReading = input.TotalMeterReading;
        entity.DavidColdReading = input.DavidColdReading;
        entity.DavidWarmReading = input.DavidWarmReading;
        entity.SarahColdReading = input.SarahColdReading;
        entity.SarahWarmReading = input.SarahWarmReading;
        return entity;
    }
}
