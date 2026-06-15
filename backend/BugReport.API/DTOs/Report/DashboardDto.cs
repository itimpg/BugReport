namespace BugReport.API.DTOs.Report;

public record DashboardDto(
    int TotalBugs,
    int OpenBugs,
    int InProgressBugs,
    int ResolvedBugs,
    int ClosedBugs,
    IEnumerable<BugsByCategoryDto> ByCategory,
    IEnumerable<BugsByMonthDto> ByMonth,
    IEnumerable<RecentBugDto> RecentBugs);

public record BugsByCategoryDto(string Category, int Count);
public record BugsByMonthDto(int Year, int Month, string MonthName, int Count);
public record RecentBugDto(Guid Id, string Title, string Status, DateTime CreatedAt, string ReporterName);
