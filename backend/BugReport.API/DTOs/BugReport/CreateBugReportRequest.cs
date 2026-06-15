using FluentValidation;

namespace BugReport.API.DTOs.BugReport;

public record CreateBugReportRequest(
    string Title,
    string Description,
    DateTime? IncidentDate,
    IEnumerable<Guid> CategoryIds);

public class CreateBugReportValidator : AbstractValidator<CreateBugReportRequest>
{
    public CreateBugReportValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.CategoryIds).NotNull();
    }
}
