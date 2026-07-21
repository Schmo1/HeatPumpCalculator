namespace HeatPumpCalculator.Api.Models;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Reader = "Reader";
}

/// <summary>User for authentication. Admin may write, Reader may only read.</summary>
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = Roles.Reader;
}
