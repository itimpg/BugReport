using BugReport.Core.Enums;

namespace BugReport.Core.Entities;

public class BugReportEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BugStatus Status { get; set; } = BugStatus.Open;
    public DateTime IncidentDate { get; set; } = DateTime.UtcNow;
    public string? ImageUrl { get; set; }
    public Guid ReportedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Reporter { get; set; } = null!;
    public ICollection<BugReportCategory> BugReportCategories { get; set; } = [];
}
