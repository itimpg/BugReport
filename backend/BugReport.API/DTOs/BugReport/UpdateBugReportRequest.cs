using BugReport.Core.Enums;
using FluentValidation;

namespace BugReport.API.DTOs.BugReport;

public record UpdateBugReportRequest(
    string Title,
    string Description,
    string Status,
    DateTime? IncidentDate,
    IEnumerable<Guid> CategoryIds);

public class UpdateBugReportValidator : AbstractValidator<UpdateBugReportRequest>
{
    public UpdateBugReportValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().IsEnumName(typeof(BugStatus));
        RuleFor(x => x.CategoryIds).NotNull();
    }
}
