using BugReport.Core.Enums;

namespace BugReport.API.DTOs.BugReport;

public record BugReportDto(
    Guid Id,
    string Title,
    string Description,
    string Status,
    DateTime IncidentDate,
    string? ImageUrl,
    Guid ReportedBy,
    string ReporterName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IEnumerable<CategoryBriefDto> Categories);

public record CategoryBriefDto(Guid Id, string Name);

public record BugReportListDto(
    IEnumerable<BugReportDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);
