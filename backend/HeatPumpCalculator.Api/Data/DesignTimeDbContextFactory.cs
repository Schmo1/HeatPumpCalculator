using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HeatPumpCalculator.Api.Data;

/// <summary>
/// Wird nur von den EF-Core-Tools zur Entwurfszeit (Migrationen) verwendet,
/// damit dafür nicht der komplette Web-Host gestartet werden muss.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=design.db")
            .Options;
        return new AppDbContext(options);
    }
}
