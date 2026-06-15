using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BugReport.API.DTOs.Auth;
using BugReport.Core.Entities;
using BugReport.Core.Enums;
using BugReport.Core.Interfaces;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace BugReport.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(
    IUserRepository userRepo,
    IConfiguration config,
    ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] GoogleLoginRequest request, CancellationToken ct)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [config["Google:ClientId"]!]
            });
        }
        catch (InvalidJwtException ex)
        {
            logger.LogWarning("Invalid Google ID token: {Message}", ex.Message);
            return Unauthorized(new { error = "Invalid Google token." });
        }

        var user = await userRepo.GetByEmailAsync(payload.Email, ct);
        if (user is null)
        {
            user = new User
            {
                Email       = payload.Email,
                DisplayName = payload.Name ?? payload.Email,
                Role        = UserRole.User
            };
            await userRepo.AddAsync(user, ct);
            logger.LogInformation("New user registered: {Email}", user.Email);
        }

        if (user.IsDisabled)
            return Forbid();

        var token    = GenerateJwtToken(user);
        var expiry   = int.Parse(config["Jwt:ExpiryMinutes"] ?? "60");
        var response = new AuthResponse(
            token, "Bearer", expiry * 60,
            new UserDto(user.Id, user.Email, user.DisplayName, user.Role.ToString()));

        return Ok(response);
    }

    [HttpPost("logout")]
    public IActionResult Logout() => Ok(new { message = "Logged out successfully." });

    private string GenerateJwtToken(User user)
    {
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:SecretKey"]!));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry  = DateTime.UtcNow.AddMinutes(double.Parse(config["Jwt:ExpiryMinutes"] ?? "60"));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name,  user.DisplayName),
            new Claim(ClaimTypes.Role,               user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             config["Jwt:Issuer"],
            audience:           config["Jwt:Audience"],
            claims:             claims,
            expires:            expiry,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
