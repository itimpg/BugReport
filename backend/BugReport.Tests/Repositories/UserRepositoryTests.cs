using BugReport.Core.Entities;
using BugReport.Core.Enums;
using BugReport.Infrastructure.Data;
using BugReport.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BugReport.Tests.Repositories;

public class UserRepositoryTests
{
    private static AppDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetByEmailAsync_ReturnsUser_WhenEmailExists()
    {
        await using var ctx = CreateContext(nameof(GetByEmailAsync_ReturnsUser_WhenEmailExists));
        var repo = new UserRepository(ctx);

        ctx.Users.Add(new User { Email = "test@example.com", DisplayName = "Test User", Role = UserRole.User });
        await ctx.SaveChangesAsync();

        var user = await repo.GetByEmailAsync("test@example.com");
        user.Should().NotBeNull();
        user!.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task GetByEmailAsync_ReturnsNull_WhenEmailDoesNotExist()
    {
        await using var ctx = CreateContext(nameof(GetByEmailAsync_ReturnsNull_WhenEmailDoesNotExist));
        var repo = new UserRepository(ctx);

        var user = await repo.GetByEmailAsync("nobody@example.com");
        user.Should().BeNull();
    }

    [Fact]
    public async Task GetPagedAsync_FiltersUsersBySearch()
    {
        await using var ctx = CreateContext(nameof(GetPagedAsync_FiltersUsersBySearch));
        var repo = new UserRepository(ctx);

        ctx.Users.AddRange(
            new User { Email = "alice@example.com", DisplayName = "Alice" },
            new User { Email = "bob@example.com",   DisplayName = "Bob" });
        await ctx.SaveChangesAsync();

        var (items, total) = await repo.GetPagedAsync("alice", 1, 10);
        total.Should().Be(1);
        items.Single().DisplayName.Should().Be("Alice");
    }
}
