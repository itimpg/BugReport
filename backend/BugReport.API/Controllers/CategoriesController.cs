using BugReport.API.DTOs.Category;
using BugReport.Core.Entities;
using BugReport.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BugReport.API.Controllers;

[ApiController]
[Route("categories")]
[Authorize]
public class CategoriesController(ICategoryRepository categoryRepo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll(CancellationToken ct)
    {
        var categories = await categoryRepo.GetAllAsync(ct);
        return Ok(categories.Select(MapToDto));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        if (!await categoryRepo.IsNameUniqueAsync(request.Name, ct: ct))
            return Conflict(new { error = $"Category name '{request.Name}' already exists." });

        var category = new Category { Name = request.Name, Description = request.Description };
        await categoryRepo.AddAsync(category, ct);
        return CreatedAtAction(nameof(GetAll), MapToDto(category));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await categoryRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Category {id} not found.");

        if (!await categoryRepo.IsNameUniqueAsync(request.Name, id, ct))
            return Conflict(new { error = $"Category name '{request.Name}' already exists." });

        category.Name        = request.Name;
        category.Description = request.Description;
        category.UpdatedAt   = DateTime.UtcNow;
        await categoryRepo.UpdateAsync(category, ct);
        return Ok(MapToDto(category));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var category = await categoryRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Category {id} not found.");

        await categoryRepo.DeleteAsync(category, ct);
        return NoContent();
    }

    private static CategoryDto MapToDto(Category c) =>
        new(c.Id, c.Name, c.Description, c.CreatedAt, c.UpdatedAt);
}
