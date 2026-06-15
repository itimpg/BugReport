# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY BugReport.sln .
COPY BugReport.Core/BugReport.Core.csproj             BugReport.Core/
COPY BugReport.Infrastructure/BugReport.Infrastructure.csproj BugReport.Infrastructure/
COPY BugReport.API/BugReport.API.csproj               BugReport.API/
COPY BugReport.Tests/BugReport.Tests.csproj           BugReport.Tests/

RUN dotnet restore BugReport.sln

COPY . .

RUN dotnet publish BugReport.API/BugReport.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "BugReport.API.dll"]
