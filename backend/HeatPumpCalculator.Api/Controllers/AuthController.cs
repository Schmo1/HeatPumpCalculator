using System.Security.Claims;
using HeatPumpCalculator.Api.Auth;
using HeatPumpCalculator.Api.Data;
using HeatPumpCalculator.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeatPumpCalculator.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _tokens;

    public AuthController(AppDbContext db, JwtTokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Benutzername oder Passwort ist falsch." });

        return _tokens.CreateToken(user);
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<CurrentUserDto> Me()
    {
        var name = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        return new CurrentUserDto(name, role);
    }
}
