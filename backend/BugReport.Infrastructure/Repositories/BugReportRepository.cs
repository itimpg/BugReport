using BugReport.Core.Entities;
using BugReport.Core.Enums;
using BugReport.Core.Interfaces;
using BugReport.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BugReport.Infrastructure.Repositories;

public class BugReportRepository(AppDbContext context) : BaseRepository<BugReportEntity>(context), IBugReportRepository
{
    public async Task<(IEnumerable<BugReportEntity> Items, int TotalCount)> GetPagedAsync(
        string? search,
        Guid? categoryId,
        BugStatus? status,
        int page,
        int pageSize,
        Guid? reportedBy = null,
        CancellationToken ct = default)
    {
        var query = DbSet
            .Include(b => b.Reporter)
            .Include(b => b.BugReportCategories)
                .ThenInclude(bc => bc.Category)
            .AsQueryable();

        if (reportedBy.HasValue)
            query = query.Where(b => b.ReportedBy == reportedBy.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Title.ToLower().Contains(search.ToLower()));

        if (categoryId.HasValue)
            query = query.Where(b => b.BugReportCategories.Any(bc => bc.CategoryId == categoryId.Value));

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<BugReportEntity?> GetWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await DbSet
            .Include(b => b.Reporter)
            .Include(b => b.BugReportCategories)
                .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
}
