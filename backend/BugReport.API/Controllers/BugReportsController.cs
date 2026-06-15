using System.Security.Claims;
using BugReport.API.DTOs.BugReport;
using BugReport.Core.Entities;
using BugReport.Core.Enums;
using BugReport.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BugReport.API.Controllers;

[ApiController]
[Route("bugs")]
[Authorize]
public class BugReportsController(
    IBugReportRepository bugRepo,
    ICategoryRepository categoryRepo,
    IStorageService storageService,
    ILogger<BugReportsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<BugReportListDto>> GetAll(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        BugStatus? bugStatus = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<BugStatus>(status, true, out var parsed))
            bugStatus = parsed;

        var isAdmin   = User.IsInRole("Admin");
        Guid? ownerId = isAdmin ? null : GetCurrentUserId();

        var (items, total) = await bugRepo.GetPagedAsync(search, categoryId, bugStatus, page, pageSize, ownerId, ct);
        var dtos = items.Select(MapToDto);
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);

        return Ok(new BugReportListDto(dtos, total, page, pageSize, totalPages));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BugReportDto>> GetById(Guid id, CancellationToken ct)
    {
        var bug = await bugRepo.GetWithDetailsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Bug report {id} not found.");

        if (!User.IsInRole("Admin") && bug.ReportedBy != GetCurrentUserId())
            throw new UnauthorizedAccessException("Access denied.");

        return Ok(MapToDto(bug));
    }

    [HttpPost]
    public async Task<ActionResult<BugReportDto>> Create(
        [FromForm] CreateBugReportRequest request,
        IFormFile? image,
        CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        string? imageUrl = null;

        if (image is not null)
        {
            var fileKey = await storageService.UploadAsync(
                image.OpenReadStream(), image.FileName, image.ContentType, ct);
            imageUrl = BuildProxyUrl(Request, fileKey);
        }

        var bug = new BugReportEntity
        {
            Title        = request.Title,
            Description  = request.Description,
            IncidentDate = request.IncidentDate ?? DateTime.UtcNow,
            ImageUrl     = imageUrl,
            ReportedBy   = userId
        };

        foreach (var catId in request.CategoryIds)
            bug.BugReportCategories.Add(new BugReportCategory { BugReportId = bug.Id, CategoryId = catId });

        await bugRepo.AddAsync(bug, ct);
        logger.LogInformation("Bug report {Id} created by user {UserId}", bug.Id, userId);

        var created = await bugRepo.GetWithDetailsAsync(bug.Id, ct);
        return CreatedAtAction(nameof(GetById), new { id = bug.Id }, MapToDto(created!));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BugReportDto>> Update(
        Guid id,
        [FromForm] UpdateBugReportRequest request,
        IFormFile? image,
        CancellationToken ct)
    {
        var bug = await bugRepo.GetWithDetailsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Bug report {id} not found.");

        if (!User.IsInRole("Admin") && bug.ReportedBy != GetCurrentUserId())
            throw new UnauthorizedAccessException("Access denied.");

        if (image is not null)
        {
            if (!string.IsNullOrEmpty(bug.ImageUrl))
                await storageService.DeleteAsync(ExtractFileKey(bug.ImageUrl), ct);
            var fileKey = await storageService.UploadAsync(image.OpenReadStream(), image.FileName, image.ContentType, ct);
            bug.ImageUrl = BuildProxyUrl(Request, fileKey);
        }

        bug.Title        = request.Title;
        bug.Description  = request.Description;
        bug.Status       = Enum.Parse<BugStatus>(request.Status);
        bug.IncidentDate = request.IncidentDate ?? bug.IncidentDate;
        bug.UpdatedAt    = DateTime.UtcNow;

        bug.BugReportCategories.Clear();
        foreach (var catId in request.CategoryIds)
            bug.BugReportCategories.Add(new BugReportCategory { BugReportId = bug.Id, CategoryId = catId });

        await bugRepo.UpdateAsync(bug, ct);
        return Ok(MapToDto(bug));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var bug = await bugRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Bug report {id} not found.");

        if (!User.IsInRole("Admin") && bug.ReportedBy != GetCurrentUserId())
            throw new UnauthorizedAccessException("Access denied.");

        bug.IsDeleted = true;
        bug.UpdatedAt = DateTime.UtcNow;
        await bugRepo.UpdateAsync(bug, ct);
        return NoContent();
    }

    private static string BuildProxyUrl(HttpRequest request, string fileKey)
        => $"{request.Scheme}://{request.Host}/images/{fileKey}";

    private static string ExtractFileKey(string imageUrl)
        => Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ? uri.Segments.Last() : imageUrl;

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub")
                 ?? throw new UnauthorizedAccessException("User ID not found in token.");
        return Guid.Parse(claim.Value);
    }

    private static BugReportDto MapToDto(BugReportEntity b) => new(
        b.Id, b.Title, b.Description, b.Status.ToString(),
        b.IncidentDate, b.ImageUrl, b.ReportedBy,
        b.Reporter?.DisplayName ?? string.Empty,
        b.CreatedAt, b.UpdatedAt,
        b.BugReportCategories.Select(bc => new CategoryBriefDto(bc.Category.Id, bc.Category.Name)));
}
