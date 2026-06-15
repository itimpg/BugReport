# Project Overview

สร้าง Web Application สำหรับรายงานข้อผิดพลาด (Bug Reporting System)

## Technology Stack

### Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod Validation

### Backend

* ASP.NET Core 8 Web API
* Entity Framework Core

### Database

* PostgreSQL (Supabase)

### Authentication

* Google OAuth Login
* Supabase Auth

### Deployment

* Frontend: Vercel
* Backend: Deployable as Docker Container
* Database: Supabase PostgreSQL

---

# Functional Requirements

## 1. Authentication

Users must login using Google Account.

Roles:

* Admin
* User

Permissions:

User:

* Create bug report
* View own bug reports

Admin:

* View all bug reports
* Manage categories
* Manage users
* View dashboard reports

---

## 2. Bug Report Management

### Create Bug Report

Fields:

* id (UUID)
* title (required)
* description (required)
* categories (multi-select)
* incidentDate (default current datetime)
* imageUrl
* reportedBy
* createdAt
* updatedAt
* status

Status values:

* Open
* In Progress
* Resolved
* Closed

Requirements:

* User can upload image
* Store image in Supabase Storage
* Save image URL in database
* Multiple categories can be assigned to one bug report
* Validation required

### List Bug Reports

Features:

* Search by title
* Filter by category
* Filter by status
* Sort by latest created date
* Pagination

### Edit Bug Report

User can edit own report.

Admin can edit all reports.

### Delete Bug Report

Soft Delete

---

## 3. Category Management

Admin only

CRUD operations

Fields:

* id
* name
* description
* createdAt
* updatedAt

Validation:

* Category name must be unique

---

## 4. User Management

Admin only

Fields:

* id
* email
* displayName
* role
* createdAt

Features:

* Search user
* Change role
* Disable user

---

## 5. Dashboard & Reporting

Dashboard page

### KPI Cards

* Total Bugs
* Open Bugs
* In Progress Bugs
* Resolved Bugs
* Closed Bugs

### Charts

Bugs by Category

Bugs by Month

Recent Bug Reports

### Filters

* Month
* Year
* Category

Filters can be combined

Example:

Month = June 2026
Category = UI

Show only matching records

---

# Database Design

Entities:

User
Category
BugReport
BugReportCategory

Relationships:

User 1:N BugReport

BugReport N:M Category

---

# API Requirements

Generate REST API

Authentication:

* JWT

Endpoints:

Auth

* POST /auth/login
* POST /auth/logout

Users

* GET /users
* PUT /users/{id}/role

Categories

* GET /categories
* POST /categories
* PUT /categories/{id}
* DELETE /categories/{id}

Bug Reports

* GET /bugs
* GET /bugs/{id}
* POST /bugs
* PUT /bugs/{id}
* DELETE /bugs/{id}

Reports

* GET /reports/dashboard
* GET /reports/monthly

---

# UI Pages

/public

* Login Page

/protected

* Dashboard
* Bug Reports
* Create Bug Report
* Edit Bug Report
* Categories
* Users

---

# Non Functional Requirements

* Responsive Design
* Mobile Friendly
* Clean Architecture
* Repository Pattern
* DTO Pattern
* Swagger Documentation
* Unit Tests
* Error Handling Middleware
* Logging
* Environment Variables

---

# Deliverables

Generate:

1. Complete Database Schema
2. Entity Framework Models
3. ASP.NET Core Web API
4. JWT Authentication
5. Google OAuth Integration
6. Next.js Frontend
7. Supabase Storage Integration
8. Dockerfile
9. Deployment Guide
10. README.md

Use production-ready code and best practices.
