# Bug Report System

A full-stack web application for tracking and managing bug reports, built with **ASP.NET Core 8** and **Next.js 15**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core 8 |
| Database | PostgreSQL via Supabase |
| Auth | Google OAuth 2.0 + JWT |
| Storage | Supabase Storage (images) |
| Deploy | Vercel (frontend) / Docker (backend) |

---

## Features

### Roles

| Feature | User | Admin |
|---|---|---|
| Create bug report | ✅ | ✅ |
| View own bug reports | ✅ | ✅ |
| View all bug reports | — | ✅ |
| Edit/delete own reports | ✅ | ✅ |
| Edit/delete any report | — | ✅ |
| Manage categories | — | ✅ |
| Manage users (roles, disable) | — | ✅ |
| Dashboard & analytics | — | ✅ |

### Bug Reports
- Create with title, description, categories (multi-select), incident date, and image upload
- Search by title, filter by category and status, paginated results
- Soft delete (records preserved in database)

### Dashboard
- KPI cards: Total, Open, In Progress, Resolved, Closed
- Bar chart: Bugs by Category
- Line chart: Bugs by Month
- Recent bugs table
- Filters: Month, Year, Category (combinable)

---

## Project Structure

```
BugReport/
├── backend/
│   ├── BugReport.sln
│   ├── BugReport.Core/          # Entities, Interfaces, Enums
│   ├── BugReport.Infrastructure/# DbContext, Repositories, Services
│   ├── BugReport.API/           # Controllers, DTOs, Middleware
│   └── BugReport.Tests/         # Unit tests (xUnit)
├── frontend/
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # UI components
│       ├── contexts/            # React contexts (Auth)
│       ├── hooks/               # Custom hooks
│       ├── lib/                 # API client, Supabase, utils
│       └── types/               # TypeScript types
├── database/
│   └── schema.sql               # PostgreSQL schema + seed data
├── docker-compose.yml
├── .env.example
├── DEPLOYMENT.md
└── README.md
```

---

## Quick Start

### 1. Database

Run `database/schema.sql` in your Supabase SQL Editor.

### 2. Backend

```bash
cd backend

# Copy and configure
cp BugReport.API/appsettings.json BugReport.API/appsettings.Development.json
# Edit appsettings.Development.json with your credentials

dotnet restore
dotnet run --project BugReport.API
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev
# App: http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Google OAuth login |
| POST | `/auth/logout` | User | Logout |
| GET | `/bugs` | User | List bug reports (paginated) |
| GET | `/bugs/{id}` | User | Get bug report details |
| POST | `/bugs` | User | Create bug report |
| PUT | `/bugs/{id}` | User/Admin | Update bug report |
| DELETE | `/bugs/{id}` | User/Admin | Soft delete bug report |
| GET | `/categories` | User | List categories |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/{id}` | Admin | Update category |
| DELETE | `/categories/{id}` | Admin | Delete category |
| GET | `/users` | Admin | List users |
| PUT | `/users/{id}/role` | Admin | Change user role |
| PUT | `/users/{id}/disable` | Admin | Enable/disable user |
| GET | `/reports/dashboard` | Admin | Dashboard data |
| GET | `/reports/monthly` | Admin | Monthly report |

---

## Architecture

### Backend (Clean Architecture)

```
BugReport.API           → HTTP layer (Controllers, DTOs, Middleware)
BugReport.Infrastructure → Data layer (EF Core, Repositories, Supabase Storage)
BugReport.Core          → Domain layer (Entities, Interfaces, Enums)
BugReport.Tests         → Unit tests
```

Patterns used: Repository Pattern, DTO Pattern, Dependency Injection, Middleware pipeline.

### Frontend (Next.js App Router)

- **Server Components** for layout and static content
- **Client Components** for interactive forms and data fetching
- **AuthContext** for global auth state (JWT stored in localStorage)
- Responsive design, mobile-friendly

---

## License

MIT
