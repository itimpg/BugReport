namespace BugReport.Core.Entities;

public class BugReportCategory
{
    public Guid BugReportId { get; set; }
    public Guid CategoryId { get; set; }

    public BugReportEntity BugReport { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
