using BugReport.Core.Entities;
using BugReport.Infrastructure.Data;
using BugReport.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BugReport.Tests.Repositories;

public class CategoryRepositoryTests
{
    private static AppDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task AddAsync_ShouldPersistCategory()
    {
        await using var ctx  = CreateContext(nameof(AddAsync_ShouldPersistCategory));
        var repo = new CategoryRepository(ctx);

        var category = new Category { Name = "UI", Description = "UI bugs" };
        var result   = await repo.AddAsync(category);

        result.Id.Should().NotBeEmpty();
        (await ctx.Categories.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task IsNameUniqueAsync_ReturnsFalse_WhenNameExists()
    {
        await using var ctx  = CreateContext(nameof(IsNameUniqueAsync_ReturnsFalse_WhenNameExists));
        var repo = new CategoryRepository(ctx);

        ctx.Categories.Add(new Category { Name = "API" });
        await ctx.SaveChangesAsync();

        var isUnique = await repo.IsNameUniqueAsync("API");
        isUnique.Should().BeFalse();
    }

    [Fact]
    public async Task IsNameUniqueAsync_ReturnsTrue_WhenNameDoesNotExist()
    {
        await using var ctx  = CreateContext(nameof(IsNameUniqueAsync_ReturnsTrue_WhenNameDoesNotExist));
        var repo = new CategoryRepository(ctx);

        var isUnique = await repo.IsNameUniqueAsync("NewCategory");
        isUnique.Should().BeTrue();
    }
}
