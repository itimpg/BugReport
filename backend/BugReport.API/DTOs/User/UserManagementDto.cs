using FluentValidation;

namespace BugReport.API.DTOs.User;

public record UserManagementDto(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    bool IsDisabled,
    DateTime CreatedAt);

public record UserListDto(
    IEnumerable<UserManagementDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

public record UpdateRoleRequest(string Role);
public record DisableUserRequest(bool IsDisabled);

public class UpdateRoleValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleValidator()
    {
        RuleFor(x => x.Role).NotEmpty().Must(r => r is "Admin" or "User")
            .WithMessage("Role must be 'Admin' or 'User'.");
    }
}
