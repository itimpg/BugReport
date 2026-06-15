using BugReport.API.DTOs.Report;
using BugReport.Core.Enums;
using BugReport.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BugReport.API.Controllers;

[ApiController]
[Route("reports")]
[Authorize(Policy = "AdminOnly")]
public class ReportsController(AppDbContext db) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> GetDashboard(
        [FromQuery] int? month,
        [FromQuery] int? year,
        [FromQuery] Guid? categoryId,
        CancellationToken ct)
    {
        var query = db.BugReports
            .Include(b => b.Reporter)
            .Include(b => b.BugReportCategories).ThenInclude(bc => bc.Category)
            .AsQueryable();

        if (month.HasValue && year.HasValue)
            query = query.Where(b => b.IncidentDate.Month == month.Value && b.IncidentDate.Year == year.Value);
        else if (year.HasValue)
            query = query.Where(b => b.IncidentDate.Year == year.Value);

        if (categoryId.HasValue)
            query = query.Where(b => b.BugReportCategories.Any(bc => bc.CategoryId == categoryId.Value));

        var bugs = await query.ToListAsync(ct);

        var byCategory = bugs
            .SelectMany(b => b.BugReportCategories.Select(bc => bc.Category.Name))
            .GroupBy(n => n)
            .Select(g => new BugsByCategoryDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var byMonth = bugs
            .GroupBy(b => new { b.IncidentDate.Year, b.IncidentDate.Month })
            .Select(g => new BugsByMonthDto(
                g.Key.Year,
                g.Key.Month,
                new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM"),
                g.Count()))
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToList();

        var recent = bugs
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .Select(b => new RecentBugDto(b.Id, b.Title, b.Status.ToString(), b.CreatedAt, b.Reporter.DisplayName))
            .ToList();

        var dashboard = new DashboardDto(
            bugs.Count,
            bugs.Count(b => b.Status == BugStatus.Open),
            bugs.Count(b => b.Status == BugStatus.InProgress),
            bugs.Count(b => b.Status == BugStatus.Resolved),
            bugs.Count(b => b.Status == BugStatus.Closed),
            byCategory, byMonth, recent);

        return Ok(dashboard);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<IEnumerable<BugsByMonthDto>>> GetMonthly(
        [FromQuery] int year,
        CancellationToken ct)
    {
        var data = await db.BugReports
            .Where(b => b.IncidentDate.Year == year)
            .GroupBy(b => b.IncidentDate.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .OrderBy(x => x.Month)
            .ToListAsync(ct);

        var result = data.Select(d => new BugsByMonthDto(
            year, d.Month,
            new DateTime(year, d.Month, 1).ToString("MMMM"),
            d.Count));

        return Ok(result);
    }
}
