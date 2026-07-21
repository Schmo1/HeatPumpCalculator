using HeatPumpCalculator.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HeatPumpCalculator.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<BillingPeriod> BillingPeriods => Set<BillingPeriod>();
    public DbSet<MonthlyBill> MonthlyBills => Set<MonthlyBill>();
    public DbSet<WaterPeriod> WaterPeriods => Set<WaterPeriod>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BillingPeriod>()
            .HasMany(b => b.MonthlyBills)
            .WithOne(m => m.BillingPeriod!)
            .HasForeignKey(m => m.BillingPeriodId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }
}
