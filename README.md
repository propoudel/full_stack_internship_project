# Job Portal — Full-Stack Internship Project

## 📌 Project Overview

This project is a **full-stack Job Portal** designed to help job seekers find and apply for jobs and allow companies/recruiters to publish and manage job vacancies.

The purpose of this project is not only to build a working application, but also to learn and demonstrate **professional software development practices** used in real-world projects.

You will build:

* **Backend:** Node.js + Express.js + TypeScript
* **Frontend:** Next.js + TypeScript + Tailwind CSS
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JWT-based authentication
* **API:** REST API
* **Version Control:** Git + GitHub

The application should be developed as if it were going to be used by a real company.

---

# 🎯 Project Objectives

By completing this project, you should learn how to:

* Build a REST API using Express.js
* Work with TypeScript
* Design a relational database
* Use PostgreSQL
* Use Prisma ORM and database migrations
* Implement authentication and authorization
* Build reusable React/Next.js components
* Build responsive interfaces using Tailwind CSS
* Consume REST APIs from Next.js
* Handle forms and validation
* Implement search, filtering and pagination
* Write clean and maintainable code
* Write unit/integration tests
* Use Git professionally
* Create meaningful commits and pull requests
* Debug frontend and backend issues
* Document APIs and project decisions

---

# 🏗️ High-Level Architecture

The application will have three major components:

```text
┌──────────────────────────┐
│       Next.js Frontend   │
│                          │
│  React + TypeScript      │
│  Tailwind CSS            │
└────────────┬─────────────┘
             │
             │ REST API / JSON
             ▼
┌──────────────────────────┐
│      Express Backend     │
│                          │
│  Node.js + TypeScript    │
│  REST API                │
│  Authentication          │
│  Business Logic          │
└────────────┬─────────────┘
             │
             │ Prisma
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│                          │
│ Users                    │
│ Companies                │
│ Jobs                     │
│ Applications             │
│ etc.                     │
└──────────────────────────┘
```

The frontend must **not directly access PostgreSQL**.

All database operations must go through the backend API.

---

# 📁 Recommended Repository Structure

Use a monorepo structure:

```text
job-portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── api.md
│   └── architecture.md
│
├── .gitignore
├── README.md
└── package.json
```

You may improve this structure if you have a good technical reason. Discuss significant architectural changes before implementing them.

---

# 👥 User Roles

The system should support three primary roles.

## 1. Job Seeker

A job seeker can:

* Register
* Login
* Logout
* Manage profile
* Upload/update resume
* Search jobs
* Filter jobs
* View job details
* Save/bookmark jobs
* Apply for jobs
* View submitted applications
* Track application status

---

## 2. Employer / Recruiter

An employer can:

* Register
* Login
* Manage company profile
* Create job postings
* Edit job postings
* Delete/deactivate job postings
* View their jobs
* View applications for their jobs
* View candidate information
* Change application status

Example application statuses:

```text
Applied
Shortlisted
Interview
Rejected
Hired
```

---

## 3. Administrator

An administrator can:

* Login
* View users
* View companies
* View jobs
* Approve/reject companies
* Approve/reject job postings
* Disable users
* View applications
* View basic system statistics

---

# 🧩 Core Features

## Authentication

Implement:

* User registration
* Login
* Logout
* Password hashing
* JWT authentication
* Protected API routes
* Role-based authorization
* Current-user endpoint

Example:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Passwords must **never be stored as plain text**.

---

# 👤 User Management

User fields should include appropriate information such as:

```text
id
name
email
passwordHash
role
phone
isActive
createdAt
updatedAt
```

Do not expose sensitive fields such as `passwordHash` through API responses.

---

# 🏢 Company Management

A company should contain information such as:

```text
id
name
description
logo
website
email
phone
address
industry
companySize
createdAt
updatedAt
```

Employers should be able to manage their company profile.

---

# 💼 Job Management

A job should contain information such as:

```text
id
companyId
title
description
requirements
location
employmentType
experienceLevel
salaryMin
salaryMax
deadline
status
createdAt
updatedAt
```

Possible employment types:

```text
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
REMOTE
```

Possible job statuses:

```text
DRAFT
PENDING_APPROVAL
PUBLISHED
CLOSED
REJECTED
```

---

# 🔎 Job Search

The public job listing page should support:

### Search

Search by:

* Job title
* Company
* Keyword

### Filters

Filter by:

* Location
* Employment type
* Experience level
* Salary range
* Category

### Sorting

Support sorting such as:

```text
Newest
Oldest
Salary: Low → High
Salary: High → Low
```

### Pagination

Do not load every job from the database.

Use server-side pagination.

Example:

```http
GET /api/v1/jobs?page=1&limit=20
```

Response should contain pagination information.

Example:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

---

# 📄 Job Details

A public user should be able to open a job and see:

* Job title
* Company
* Location
* Description
* Requirements
* Salary
* Employment type
* Experience level
* Application deadline
* Number of applicants
* Apply button

If the job is closed or the deadline has passed, the user should not be able to submit a new application.

---

# 📝 Job Application

A job seeker should be able to apply to a job.

Application should contain information such as:

```text
id
jobId
candidateId
resume
coverLetter
status
createdAt
updatedAt
```

A candidate should not be able to apply to the same job multiple times.

The backend must enforce this rule.

Do not rely only on frontend validation.

---

# ⭐ Saved Jobs

Job seekers should be able to:

* Save a job
* Remove a saved job
* View saved jobs

Example:

```http
POST   /api/v1/jobs/:id/save
DELETE /api/v1/jobs/:id/save
GET    /api/v1/users/me/saved-jobs
```

---

# 📊 Employer Dashboard

Create a basic dashboard showing:

```text
Total Jobs
Published Jobs
Closed Jobs
Total Applications
Applications by Status
```

The dashboard should only show information belonging to the authenticated employer.

---

# 🛠️ Admin Dashboard

Create a simple admin dashboard showing:

```text
Total Users
Total Companies
Total Jobs
Total Applications
Pending Company Approvals
Pending Job Approvals
```

Admin should be able to perform basic moderation actions.

---

# 🔐 Authorization Rules

Authorization must be implemented on the backend.

Example:

```text
JOB_SEEKER
    ↓
Can apply for jobs

EMPLOYER
    ↓
Can create/manage own jobs

ADMIN
    ↓
Can manage the entire system
```

A recruiter must not be able to modify another recruiter's job by manually changing an ID in the API request.

For example, this must be prevented:

```http
PUT /api/v1/jobs/123
```

if job `123` belongs to another employer.

---

# 🗄️ Database Design

Use PostgreSQL with Prisma ORM.

Prisma provides type-safe database access and a migration system, so database schema changes should be committed as migrations rather than manually modifying the database.

At minimum, the database should contain entities similar to:

```text
User
Company
Job
JobApplication
SavedJob
Category
```

You are responsible for designing the relationships correctly.

Example:

```text
User
 │
 ├── Job Applications
 │
 ├── Saved Jobs
 │
 └── Company
       │
       └── Jobs
              │
              └── Applications
```

You may introduce additional tables if required.

---

# 🔌 Backend API Requirements

All APIs should use a consistent URL structure:

```text
/api/v1/...
```

Example:

```text
/api/v1/auth
/api/v1/users
/api/v1/companies
/api/v1/jobs
/api/v1/applications
```

Use appropriate HTTP methods:

```text
GET     → Read
POST    → Create
PUT/PATCH → Update
DELETE  → Delete
```

Express routing should be separated from business logic. Express applications are built around middleware and route handlers, so keep controllers, middleware, services, and routes separated rather than putting everything inside `app.ts`.

---

# 📦 API Response Format

Use a consistent response structure.

Successful response:

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Job not found",
  "errors": []
}
```

Do not return random response structures from different endpoints.

---

# ❌ Error Handling

Implement centralized error handling.

The backend should correctly handle:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Do not expose database errors, stack traces, passwords, tokens, or other internal information to users.

Express supports centralized error-handling middleware; follow this pattern rather than adding independent `try/catch` response logic everywhere.

---

# ✅ Validation

Validate all incoming data on the backend.

Examples:

### Registration

```text
Name → required
Email → required + valid email
Password → required + minimum length
Role → allowed values only
```

### Job

```text
Title → required
Description → required
Company → valid company
Deadline → valid date
Salary → valid number
Employment Type → allowed value
```

Frontend validation is useful for user experience, but **backend validation is mandatory**.

---

# 🎨 Frontend Requirements

Use:

* Next.js
* TypeScript
* Tailwind CSS
* Responsive design

The UI should work on:

```text
Desktop
Tablet
Mobile
```

Do not create every page as one huge component.

Build reusable components.

Example:

```text
Button
Input
Select
Modal
Table
Pagination
JobCard
CompanyCard
LoadingSpinner
EmptyState
ErrorMessage
```

---

# 📱 Required Pages

## Public Pages

```text
/
    Home

/jobs
    Job listing

/jobs/[id]
    Job details

/companies
    Company listing

/companies/[id]
    Company details

/login
    Login

/register
    Registration
```

---

## Job Seeker Pages

```text
/dashboard
/profile
/saved-jobs
/applications
/applications/[id]
```

---

## Employer Pages

```text
/employer/dashboard
/employer/company
/employer/jobs
/employer/jobs/create
/employer/jobs/[id]/edit
/employer/jobs/[id]/applications
```

---

## Admin Pages

```text
/admin/dashboard
/admin/users
/admin/companies
/admin/jobs
/admin/applications
```

---

# 🔄 Frontend API Layer

Do not write API calls directly inside every React component.

Create a dedicated API/service layer.

For example:

```text
services/
    auth.service.ts
    job.service.ts
    company.service.ts
    application.service.ts
    user.service.ts
```

Example concept:

```typescript
jobService.getJobs()
jobService.getJob(id)
jobService.createJob(data)
jobService.updateJob(id, data)
```

Components should consume these services instead of directly calling `fetch()` everywhere.

---

# ⏳ Loading / Error / Empty States

Every API-driven page should consider:

### Loading

```text
Loading jobs...
```

### Error

```text
Unable to load jobs.
Try again.
```

### Empty

```text
No jobs found.
```

Do not leave blank screens when an API request is loading or fails.

---

# 📋 Forms

Forms should:

* Validate input
* Display validation errors
* Disable submit while submitting
* Show success/error feedback
* Prevent duplicate submissions
* Handle API validation errors

Examples:

```text
Login
Registration
Create Job
Edit Job
Company Profile
Apply Job
```

---

# 🔒 Security Requirements

The following are mandatory:

* Hash passwords
* Never return password hashes
* Validate request data
* Validate authorization
* Protect private endpoints
* Do not commit `.env`
* Do not commit secrets
* Configure CORS correctly
* Avoid exposing internal errors
* Prevent duplicate applications
* Verify resource ownership on update/delete operations

Never trust IDs, roles, or permissions supplied by the frontend.

The backend is the final authority.

---

# 🧪 Testing Requirements

Write tests for important backend functionality.

At minimum, test:

### Authentication

* Register successfully
* Reject duplicate email
* Login successfully
* Reject invalid credentials
* Reject unauthorized requests

### Jobs

* Create job
* Get jobs
* Get job details
* Update own job
* Prevent updating another employer's job
* Delete/deactivate job
* Search jobs
* Filter jobs

### Applications

* Apply successfully
* Prevent duplicate application
* Prevent applying to closed job
* Employer can view applications
* Unauthorized user cannot access applications

The goal is not to achieve a specific percentage blindly. Tests should protect important business rules.

---

# 🧹 Code Quality

Follow these principles:

### Keep functions small

Avoid:

```text
One 500-line controller
```

Prefer:

```text
Controller
    ↓
Service
    ↓
Repository / Prisma
```

### Separation of concerns

Controllers should handle HTTP concerns.

Services should contain business logic.

Repositories/data-access code should handle database operations where appropriate.

Validators should handle request validation.

Middleware should handle cross-cutting concerns.

---

# 📐 Backend Layer Example

A request should generally flow like this:

```text
HTTP Request
     ↓
Route
     ↓
Authentication Middleware
     ↓
Validation Middleware
     ↓
Controller
     ↓
Service
     ↓
Repository / Prisma
     ↓
PostgreSQL
     ↓
Response
```

For example:

```text
POST /api/v1/jobs

Route
 ↓
authMiddleware
 ↓
validateCreateJob
 ↓
jobController.create
 ↓
jobService.create
 ↓
Prisma
 ↓
PostgreSQL
```

---

# 🌐 API Documentation

Create:

```text
docs/api.md
```

Document every API endpoint.

For each endpoint include:

```text
Method
URL
Authentication
Description
Request parameters
Request body
Success response
Error responses
```

Example:

```text
POST /api/v1/jobs

Authentication:
Required - EMPLOYER

Request:

{
  "title": "Software Developer",
  "description": "...",
  "location": "Kathmandu"
}

Response:

{
  "success": true,
  "message": "Job created successfully",
  "data": {}
}
```

---

# 🌱 Environment Variables

Do not commit `.env`.

Create:

```text
.env.example
```

Example:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=
CORS_ORIGIN=
NEXT_PUBLIC_API_URL=
```

Every developer should be able to create their own `.env` from `.env.example`.

---

# 🔀 Git Workflow

Use feature branches.

Do not work directly on `main`.

Example:

```text
main
 │
 ├── feature/authentication
 ├── feature/job-management
 ├── feature/job-search
 ├── feature/applications
 └── feature/admin-dashboard
```

Recommended workflow:

```bash
git checkout main
git pull

git checkout -b feature/job-search
```

After completing the feature:

```bash
git add .
git commit -m "feat: implement job search"

git push origin feature/job-search
```

Then create a Pull Request.

---

# 📝 Commit Convention

Use meaningful commits.

Good:

```text
feat: implement user registration
feat: add job search API
feat: add employer dashboard
fix: prevent duplicate job applications
fix: handle expired job deadline
refactor: separate job service from controller
test: add authentication tests
docs: update API documentation
```

Avoid:

```text
update
changes
done
final
test
asdf
```

---

# 🔀 Pull Request Requirements

Every Pull Request should include:

```text
What was implemented?
Why was it implemented?
How was it tested?
Are there any known issues?
```

Example:

```markdown
## Summary

Implemented job search and filtering.

## Changes

- Added job search API
- Added location filter
- Added employment type filter
- Added pagination
- Added frontend search UI

## Testing

- Tested keyword search
- Tested location filter
- Tested pagination
- Tested empty results

## Known Issues

None
```

---

# 📋 Development Milestones

The project should be developed incrementally.

## Phase 1 — Project Setup

* [ ] Create GitHub repository
* [ ] Setup backend
* [ ] Setup frontend
* [ ] Setup TypeScript
* [ ] Setup PostgreSQL
* [ ] Setup Prisma
* [ ] Configure environment variables
* [ ] Create initial database migration
* [ ] Create basic API health endpoint
* [ ] Create basic Next.js layout

---

## Phase 2 — Database & Authentication

* [ ] Design database
* [ ] Create User model
* [ ] Create Company model
* [ ] Implement registration
* [ ] Implement login
* [ ] Implement JWT authentication
* [ ] Implement role authorization
* [ ] Implement current-user API
* [ ] Create login/register pages
* [ ] Protect private frontend routes

---

## Phase 3 — Company Management

* [ ] Company creation
* [ ] Company profile
* [ ] Company update
* [ ] Company listing
* [ ] Company details
* [ ] Employer authorization

---

## Phase 4 — Job Management

* [ ] Create job
* [ ] Edit job
* [ ] Delete/deactivate job
* [ ] Publish job
* [ ] Job listing
* [ ] Job details
* [ ] Job search
* [ ] Job filtering
* [ ] Sorting
* [ ] Pagination

---

## Phase 5 — Applications

* [ ] Apply for job
* [ ] Prevent duplicate applications
* [ ] Candidate application list
* [ ] Employer application list
* [ ] Application details
* [ ] Application status update

---

## Phase 6 — Saved Jobs

* [ ] Save job
* [ ] Remove saved job
* [ ] Saved jobs page

---

## Phase 7 — Dashboards

* [ ] Job seeker dashboard
* [ ] Employer dashboard
* [ ] Admin dashboard
* [ ] Basic statistics

---

## Phase 8 — Admin

* [ ] User management
* [ ] Company management
* [ ] Job moderation
* [ ] Application overview
* [ ] Account activation/deactivation

---

## Phase 9 — Testing & Documentation

* [ ] Backend tests
* [ ] API documentation
* [ ] README updates
* [ ] Error handling review
* [ ] Security review
* [ ] Responsive UI review
* [ ] Code cleanup
* [ ] Final Pull Request

---

# ⭐ Optional Features

These are **not required for the first version**.

After the core system is completed, you may implement:

* Email notifications
* Password reset
* Resume PDF upload
* Job recommendations
* Company reviews
* Job alerts
* Advanced search
* Social login
* Admin analytics
* Application timeline
* Notification system
* Dark mode

Do not start optional features until the core requirements are completed.

---

# 🚫 Things You Should NOT Do

Do not:

* Put database queries directly inside React components
* Put all Express logic inside one file
* Store plain-text passwords
* Commit `.env`
* Hard-code API URLs
* Trust frontend authorization
* Duplicate the same component unnecessarily
* Duplicate business logic
* Ignore validation
* Ignore error handling
* Return database errors directly to users
* Create unnecessary dependencies
* Copy code without understanding it
* Work directly on `main`

If you are unsure about an architectural decision, discuss it before implementing a large change.

---

# 📖 Recommended Learning Order

If you are unfamiliar with any technology, learn in this order:

```text
1. TypeScript basics
        ↓
2. Node.js
        ↓
3. Express.js
        ↓
4. REST API concepts
        ↓
5. PostgreSQL
        ↓
6. Prisma
        ↓
7. Authentication / JWT
        ↓
8. Next.js
        ↓
9. React
        ↓
10. Tailwind CSS
        ↓
11. Testing
        ↓
12. Git / Pull Requests
```

Use the official documentation when learning instead of relying only on random tutorials.

---

# 📚 Useful Documentation

* Next.js: https://nextjs.org/docs
* Express.js: https://expressjs.com/
* Prisma: https://www.prisma.io/docs
* PostgreSQL: https://www.postgresql.org/docs/
* TypeScript: https://www.typescriptlang.org/docs/
* Tailwind CSS: https://tailwindcss.com/docs
* Git: https://git-scm.com/doc

---

# 🏁 Definition of Done

A feature is considered **DONE** only when:

* [ ] Backend API is implemented
* [ ] Database changes are implemented through migrations
* [ ] Backend validation exists
* [ ] Authorization is implemented where required
* [ ] Frontend UI is implemented
* [ ] Loading state exists
* [ ] Error state exists
* [ ] Empty state exists where applicable
* [ ] Responsive design works
* [ ] Important business rules are tested
* [ ] Code follows the project architecture
* [ ] No secrets are committed
* [ ] API documentation is updated
* [ ] Git commit messages are meaningful
* [ ] Pull Request has been created
* [ ] Feature has been reviewed

---

# 🎓 What Will Be Evaluated

This internship project will be evaluated based on more than whether the application works.

### Technical Skills

* Understanding of Node.js
* Understanding of Express
* TypeScript usage
* Database design
* Prisma usage
* REST API design
* Next.js knowledge
* React component design
* Tailwind CSS usage

### Engineering Skills

* Code organization
* Separation of concerns
* Error handling
* Validation
* Authentication
* Authorization
* Testing
* Git workflow
* Documentation

### Problem Solving

You will be expected to:

1. Understand the requirement.
2. Break it into smaller tasks.
3. Research when necessary.
4. Design a solution.
5. Implement it.
6. Test it.
7. Document it.
8. Submit it for review.

Do not expect every implementation detail to be provided.

Part of this internship is learning how to make technical decisions independently.

---

# 💡 Important Principle

**Working code is not enough.**

The goal is to learn how to build software that another developer can understand, maintain, test, and extend.

Before submitting a feature, ask yourself:

> "If another developer joins this project six months from now, will they understand my code?"

If the answer is yes, you are moving in the right direction.

---

# 🚀 Final Deliverable

At the end of the internship assignment, the GitHub repository should contain:

```text
✓ Working backend
✓ Working frontend
✓ PostgreSQL database
✓ Prisma schema
✓ Database migrations
✓ Authentication
✓ Role-based authorization
✓ Job management
✓ Job search/filtering
✓ Job applications
✓ Saved jobs
✓ Employer dashboard
✓ Admin dashboard
✓ Tests
✓ API documentation
✓ Clean Git history
✓ Setup documentation
```

The application should be runnable locally by another developer using only the instructions provided in this repository.

---

## Final Goal

Build this project as if it were a **real production application**, not a classroom CRUD project.

Focus on:

**Clean Code → Good Architecture → Security → Testing → User Experience → Documentation**
