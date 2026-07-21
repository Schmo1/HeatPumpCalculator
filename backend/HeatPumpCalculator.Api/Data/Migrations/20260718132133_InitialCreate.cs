using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HeatPumpCalculator.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillingPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Label = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalConsumptionKwh = table.Column<double>(type: "REAL", nullable: false),
                    HeatPumpMeterReading = table.Column<double>(type: "REAL", nullable: false),
                    SarahSharePercent = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingPeriods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WaterPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Label = table.Column<string>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    IsBaseline = table.Column<bool>(type: "INTEGER", nullable: false),
                    TotalMeterReading = table.Column<double>(type: "REAL", nullable: true),
                    DavidColdReading = table.Column<double>(type: "REAL", nullable: true),
                    DavidWarmReading = table.Column<double>(type: "REAL", nullable: true),
                    SarahColdReading = table.Column<double>(type: "REAL", nullable: true),
                    SarahWarmReading = table.Column<double>(type: "REAL", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaterPeriods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyBills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BillingPeriodId = table.Column<int>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Month = table.Column<string>(type: "TEXT", nullable: false),
                    Cost = table.Column<double>(type: "REAL", nullable: false),
                    Consumption = table.Column<double>(type: "REAL", nullable: true),
                    Comment = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyBills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonthlyBills_BillingPeriods_BillingPeriodId",
                        column: x => x.BillingPeriodId,
                        principalTable: "BillingPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyBills_BillingPeriodId",
                table: "MonthlyBills",
                column: "BillingPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MonthlyBills");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WaterPeriods");

            migrationBuilder.DropTable(
                name: "BillingPeriods");
        }
    }
}
