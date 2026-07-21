namespace HeatPumpCalculator.Api.Auth;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "HeatPumpCalculator";
    public string Audience { get; set; } = "HeatPumpCalculator";
    public int ExpiryHours { get; set; } = 12;
}
