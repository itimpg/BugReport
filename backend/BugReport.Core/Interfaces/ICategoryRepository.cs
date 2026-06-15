using BugReport.Core.Entities;

namespace BugReport.Core.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null, CancellationToken ct = default);
}
