namespace HeatPumpCalculator.Api.Dtos;

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, string Username, string Role, DateTime ExpiresAt);

public record CurrentUserDto(string Username, string Role);
