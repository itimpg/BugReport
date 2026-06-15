using BugReport.Core.Entities;
using BugReport.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace BugReport.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<BugReportEntity> BugReports => Set<BugReportEntity>();
    public DbSet<BugReportCategory> BugReportCategories => Set<BugReportCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresEnum<BugStatus>();
        modelBuilder.HasPostgresEnum<UserRole>();

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            e.Property(x => x.DisplayName).HasColumnName("display_name").HasMaxLength(255).IsRequired();
            e.Property(x => x.Role).HasColumnName("role").IsRequired();
            e.Property(x => x.IsDisabled).HasColumnName("is_disabled");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<BugReportEntity>(e =>
        {
            e.ToTable("bug_reports");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Title).HasColumnName("title").HasMaxLength(500).IsRequired();
            e.Property(x => x.Description).HasColumnName("description").IsRequired();
            e.Property(x => x.Status).HasColumnName("status").IsRequired();
            e.Property(x => x.IncidentDate).HasColumnName("incident_date");
            e.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(2000);
            e.Property(x => x.ReportedBy).HasColumnName("reported_by");
            e.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            e.HasOne(x => x.Reporter)
             .WithMany(u => u.BugReports)
             .HasForeignKey(x => x.ReportedBy)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder.Entity<BugReportCategory>(e =>
        {
            e.ToTable("bug_report_categories");
            e.HasKey(x => new { x.BugReportId, x.CategoryId });
            e.Property(x => x.BugReportId).HasColumnName("bug_report_id");
            e.Property(x => x.CategoryId).HasColumnName("category_id");

            e.HasOne(x => x.BugReport)
             .WithMany(b => b.BugReportCategories)
             .HasForeignKey(x => x.BugReportId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Category)
             .WithMany(c => c.BugReportCategories)
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
