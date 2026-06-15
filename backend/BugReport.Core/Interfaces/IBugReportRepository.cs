using BugReport.Core.Entities;
using BugReport.Core.Enums;

namespace BugReport.Core.Interfaces;

public interface IBugReportRepository : IRepository<BugReportEntity>
{
    Task<(IEnumerable<BugReportEntity> Items, int TotalCount)> GetPagedAsync(
        string? search,
        Guid? categoryId,
        BugStatus? status,
        int page,
        int pageSize,
        Guid? reportedBy = null,
        CancellationToken ct = default);

    Task<BugReportEntity?> GetWithDetailsAsync(Guid id, CancellationToken ct = default);
}
