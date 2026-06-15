# Deployment Guide

## Prerequisites

- Node.js 20+
- .NET SDK 8.0
- Docker & Docker Compose (for containerized deploy)
- Supabase account
- Google Cloud Console project with OAuth credentials
- Vercel account (frontend)

---

## 1. Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **API keys** (anon & service_role)

### 1.2 Run Database Schema

In the Supabase SQL Editor, run the entire contents of `database/schema.sql`.

### 1.3 Create Storage Bucket

1. Go to **Storage** → New Bucket
2. Name: `bug-images`
3. Set to **Public** (or configure RLS policies as needed)

---

## 2. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API** (People API)
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://your-app.vercel.app` (production)
7. Note the **Client ID** and **Client Secret**

---

## 3. Backend Deployment

### Option A: Docker

```bash
# 1. Copy and fill environment variables
cp .env.example .env

# 2. Build and start
docker-compose up -d --build

# API will be available at http://localhost:5000
# Swagger UI: http://localhost:5000/swagger
```

### Option B: Manual / IIS / Azure App Service

```bash
cd backend

# Restore and build
dotnet restore
dotnet build -c Release

# Run migrations (the app auto-migrates on startup)
# Or run manually:
dotnet ef database update --project BugReport.Infrastructure --startup-project BugReport.API

# Publish
dotnet publish BugReport.API -c Release -o ./publish

# Run
cd publish
ASPNETCORE_ENVIRONMENT=Production dotnet BugReport.API.dll
```

### Environment Variables (Backend)

| Variable | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Jwt__SecretKey` | JWT signing secret (min 32 chars) |
| `Jwt__Issuer` | Token issuer (e.g. `BugReportAPI`) |
| `Jwt__Audience` | Token audience (e.g. `BugReportClient`) |
| `Jwt__ExpiryMinutes` | Token lifetime in minutes |
| `Google__ClientId` | Google OAuth Client ID |
| `Google__ClientSecret` | Google OAuth Client Secret |
| `Supabase__Url` | Supabase project URL |
| `Supabase__ServiceRoleKey` | Supabase service role key |
| `Supabase__StorageBucket` | Storage bucket name |
| `Cors__AllowedOrigins__0` | Frontend origin URL |

---

## 4. Frontend Deployment (Vercel)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local from example
cp .env.local.example .env.local
# Fill in values

# Development
npm run dev

# Production build
npm run build
```

### Deploy to Vercel

1. Push the `frontend/` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Root Directory** to `frontend`
4. Add environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your backend URL (e.g. `https://api.yourapp.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Client ID |

5. Deploy

---

## 5. Running Tests

```bash
cd backend
dotnet test BugReport.Tests
```

---

## 6. Logs

The API writes structured logs to:
- Console (stdout)
- `logs/bugreport-YYYY-MM-DD.log` (rotating daily)

When deployed via Docker, use `docker logs bugreport-api -f` to tail logs.

---

## 7. Swagger API Documentation

Available at `{API_URL}/swagger` in Development mode.

For production access, set `ASPNETCORE_ENVIRONMENT=Development` temporarily or add Swagger middleware behind an auth gate.
