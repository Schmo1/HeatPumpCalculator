using HeatPumpCalculator.Api.Auth;
using HeatPumpCalculator.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HeatPumpCalculator.Api.Data;

/// <summary>
/// Legt die DB an, sät die Benutzer (Admin/Reader aus der Konfiguration)
/// und – falls noch leer – die Ausgangsdaten aus der ursprünglichen Excel.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config, ILogger logger)
    {
        await db.Database.MigrateAsync();

        await SeedUsersAsync(db, config, logger);

        if (!await db.BillingPeriods.AnyAsync())
        {
            SeedBillingData(db);
            logger.LogInformation("Abrechnungs-Startdaten aus Excel gesät.");
        }

        if (!await db.WaterPeriods.AnyAsync())
        {
            SeedWaterData(db);
            logger.LogInformation("Wasser-Startdaten aus Excel gesät.");
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(AppDbContext db, IConfiguration config, ILogger logger)
    {
        var seed = config.GetSection("Seed");
        var accounts = new[]
        {
            (User: seed["AdminUsername"] ?? "admin",  Pass: seed["AdminPassword"], Role: Roles.Admin),
            (User: seed["ReaderUsername"] ?? "viewer", Pass: seed["ReaderPassword"], Role: Roles.Reader),
        };

        foreach (var acc in accounts)
        {
            if (string.IsNullOrWhiteSpace(acc.Pass))
            {
                logger.LogWarning("Kein Passwort für Benutzer '{User}' konfiguriert – wird übersprungen.", acc.User);
                continue;
            }

            var existing = await db.Users.FirstOrDefaultAsync(u => u.Username == acc.User);
            if (existing is null)
            {
                db.Users.Add(new User
                {
                    Username = acc.User,
                    Role = acc.Role,
                    PasswordHash = PasswordHasher.Hash(acc.Pass),
                });
                logger.LogInformation("Benutzer '{User}' ({Role}) angelegt.", acc.User, acc.Role);
            }
            else
            {
                // Rolle/Passwort an aktuelle Konfiguration angleichen.
                existing.Role = acc.Role;
                existing.PasswordHash = PasswordHasher.Hash(acc.Pass);
            }
        }
    }

    private static void SeedBillingData(AppDbContext db)
    {
        db.BillingPeriods.AddRange(
            new BillingPeriod
            {
                Label = "2024", SortOrder = 1,
                TotalConsumptionKwh = 3028.92, HeatPumpMeterReading = 1484, SarahSharePercent = 50,
                MonthlyBills =
                {
                    new() { SortOrder = 1, Month = "Juli-September", Cost = 208 },
                    new() { SortOrder = 2, Month = "Oktober", Cost = 74.69 },
                    new() { SortOrder = 3, Month = "November", Cost = 100.83 },
                    new() { SortOrder = 4, Month = "Dezember", Cost = 135.87 },
                }
            },
            new BillingPeriod
            {
                Label = "2025/1", SortOrder = 2,
                TotalConsumptionKwh = 3076, HeatPumpMeterReading = 3189.01, SarahSharePercent = 55,
                MonthlyBills =
                {
                    new() { SortOrder = 1, Month = "Januar", Cost = 160.93 },
                    new() { SortOrder = 2, Month = "Februar", Cost = 125.18 },
                    new() { SortOrder = 3, Month = "März", Cost = 104.86 },
                    new() { SortOrder = 4, Month = "April", Cost = 84.25 },
                    new() { SortOrder = 5, Month = "Mai", Cost = 83.84 },
                    new() { SortOrder = 6, Month = "Juni", Cost = 69.94 },
                    new() { SortOrder = 7, Month = "Juli", Cost = 70.56 },
                }
            },
            new BillingPeriod
            {
                Label = "2025/2", SortOrder = 3,
                TotalConsumptionKwh = 2308.77, HeatPumpMeterReading = 4549, SarahSharePercent = 56,
                MonthlyBills =
                {
                    new() { SortOrder = 1, Month = "August", Cost = 75.15, Consumption = 294.47 },
                    new() { SortOrder = 2, Month = "September", Cost = 66.94, Consumption = 252.22 },
                    new() { SortOrder = 3, Month = "Oktober", Cost = 107.01, Consumption = 445.09 },
                    new() { SortOrder = 4, Month = "November", Cost = 130.77, Consumption = 556.6 },
                    new() { SortOrder = 5, Month = "Dezember", Cost = 174.8, Consumption = 760.39 },
                }
            },
            new BillingPeriod
            {
                Label = "2026/1", SortOrder = 4,
                TotalConsumptionKwh = 2843, HeatPumpMeterReading = 6140, SarahSharePercent = 58.71,
                MonthlyBills =
                {
                    new() { SortOrder = 1, Month = "Januar", Cost = 156.8, Consumption = 756 },
                    new() { SortOrder = 2, Month = "Februar", Cost = 122, Consumption = 585 },
                    new() { SortOrder = 3, Month = "März", Cost = 116.19, Consumption = 450 },
                    new() { SortOrder = 4, Month = "April", Cost = 85.3, Consumption = 389 },
                    new() { SortOrder = 5, Month = "Mai", Cost = 74.36, Consumption = 330 },
                    new() { SortOrder = 6, Month = "Juni", Cost = 74.46, Consumption = 333 },
                }
            });
    }

    private static void SeedWaterData(AppDbContext db)
    {
        db.WaterPeriods.AddRange(
            new WaterPeriod
            {
                Label = "Init", SortOrder = 0, IsBaseline = true,
                TotalMeterReading = 0,
                DavidColdReading = 0, DavidWarmReading = 0,
                SarahColdReading = 100000, SarahWarmReading = 100000,
            },
            new WaterPeriod
            {
                Label = "2025/1", SortOrder = 1,
                TotalMeterReading = 119,
                DavidColdReading = 16.2, DavidWarmReading = 5.5,
                SarahColdReading = 99987, SarahWarmReading = 99993.2,
            },
            new WaterPeriod
            {
                Label = "2025/2", SortOrder = 2,
                TotalMeterReading = 171,
                DavidColdReading = 34.2, DavidWarmReading = 11.9,
                SarahColdReading = 99971.9, SarahWarmReading = 99985.1,
            },
            new WaterPeriod
            {
                Label = "2026/1", SortOrder = 3,
                TotalMeterReading = 240,
                DavidColdReading = 59.4, DavidWarmReading = 19.46,
                SarahColdReading = 99951.5, SarahWarmReading = 99974.35,
            });
    }
}
