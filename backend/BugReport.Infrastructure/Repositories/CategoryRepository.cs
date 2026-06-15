using BugReport.Core.Entities;
using BugReport.Core.Interfaces;
using BugReport.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BugReport.Infrastructure.Repositories;

public class CategoryRepository(AppDbContext context) : BaseRepository<Category>(context), ICategoryRepository
{
    public async Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null, CancellationToken ct = default)
    {
        var query = DbSet.Where(c => c.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);
        return !await query.AnyAsync(ct);
    }
}
