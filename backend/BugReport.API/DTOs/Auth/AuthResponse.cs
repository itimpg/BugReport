namespace BugReport.API.DTOs.Auth;

public record AuthResponse(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string Role);
