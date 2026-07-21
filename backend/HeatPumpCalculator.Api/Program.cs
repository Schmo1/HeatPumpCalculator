using System.Text;
using HeatPumpCalculator.Api.Auth;
using HeatPumpCalculator.Api.Data;
using HeatPumpCalculator.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------- Konfiguration ----------
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

if (string.IsNullOrWhiteSpace(jwtOptions.Key) || jwtOptions.Key.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Key muss gesetzt sein und mindestens 32 Zeichen lang sein (z.B. per Umgebungsvariable Jwt__Key).");

// ---------- Datenbank (SQLite) ----------
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=/data/heatpump.db";
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite(connectionString));

// ---------- Dienste ----------
builder.Services.AddScoped<CalculationService>();
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddControllers();

// ---------- Authentifizierung / Autorisierung ----------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();

// ---------- CORS ----------
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();
builder.Services.AddCors(o => o.AddDefaultPolicy(policy =>
{
    if (corsOrigins.Length > 0)
        policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
    else
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

// ---------- Migration + Seeding ----------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DbSeeder.SeedAsync(db, builder.Configuration, logger);
}

// ---------- Pipeline ----------
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
