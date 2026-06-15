using BugReport.API.DTOs.User;
using BugReport.Core.Enums;
using BugReport.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BugReport.API.Controllers;

[ApiController]
[Route("users")]
[Authorize(Policy = "AdminOnly")]
public class UsersController(IUserRepository userRepo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserListDto>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var (items, total) = await userRepo.GetPagedAsync(search, page, pageSize, ct);
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        var dtos = items.Select(u => new UserManagementDto(
            u.Id, u.Email, u.DisplayName, u.Role.ToString(), u.IsDisabled, u.CreatedAt));

        return Ok(new UserListDto(dtos, total, page, pageSize, totalPages));
    }

    [HttpPut("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request, CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"User {id} not found.");

        user.Role      = Enum.Parse<UserRole>(request.Role);
        user.UpdatedAt = DateTime.UtcNow;
        await userRepo.UpdateAsync(user, ct);
        return Ok(new { message = "Role updated." });
    }

    [HttpPut("{id:guid}/disable")]
    public async Task<IActionResult> Disable(Guid id, [FromBody] DisableUserRequest request, CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"User {id} not found.");

        user.IsDisabled = request.IsDisabled;
        user.UpdatedAt  = DateTime.UtcNow;
        await userRepo.UpdateAsync(user, ct);
        return Ok(new { message = request.IsDisabled ? "User disabled." : "User enabled." });
    }
}
