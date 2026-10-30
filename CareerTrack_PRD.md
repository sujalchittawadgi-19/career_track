# CareerTrack — Product Requirements Document

## 1. Product Overview

- **Product Name:** CareerTrack — Job & Internship Application Management Platform
- **One-Line Description:** A centralized, production-grade web workspace for tracking, managing, and analyzing job and internship applications throughout the hiring pipeline.
- **Product Vision:** The single source of truth for job seekers navigating complex recruitment cycles, replacing fragmented tools with structured workflows, actionable analytics, and milestone tracking.
- **Product Mission:** Empower students, new graduates, and active job seekers to run organized, data-driven job searches that eliminate missed deadlines, streamline interview preparation, and maximize hiring conversion rates.
- **Problem Statement:** Job seekers manage dozens to hundreds of concurrent applications across job boards, emails, spreadsheets, and calendar apps. This leads to missed interview deadlines, buried rejection notices, untracked resume versions, and elevated stress.
- **Proposed Solution:** CareerTrack consolidates every stage of the recruitment lifecycle into a unified 3-tier web application backed by a structured relational PostgreSQL database with Kanban/table views, milestone tracking, and stage analytics.

**Core Goals:**

- Allow users to log an application in under 30 seconds.
- Keep upcoming interviews (next 7 days) and impending deadlines visible above the fold.
- Serve as a production-grade full-stack reference project (React, Node/Express, PostgreSQL, JWT).

## 2. Problem Analysis

| Manual Tool | Primary Shortcoming | Direct Pain Point for User |
|---|---|---|
| **Excel / Google Sheets** | Static, unlinked data, manual maintenance, no file attachments. | Formulas break, poor mobile UX, cannot link PDF resumes or dynamic stage logs. |
| **Email Inboxes** | Cluttered, unindexed by recruitment stage. | Interview links and assessment deadlines get buried under spam. |
| **Notion / Generic Notes** | Missing automated status state-machines and analytics. | Requires manual template upkeep; cannot compute conversion rates automatically. |
| **Local File System** | Disconnected from application records. | User forgets which resume version was submitted to which company. |

**Consequences of Poor Application Tracking**

- Missed deadlines and expired Online Assessments (OAs).
- Context-free interviews with no instant access to job descriptions or salary discussions.
- Inefficient search strategies with no stage-by-stage conversion visibility.
- Duplicate applications submitted before company cooldown windows expire.

## 3. Target Users & User Personas

- **Ananya Sharma (College Student):** Applying for 80+ summer internships and campus placements. Frustrated by lost resume versions and expired 48-hour HackerRank test windows. Needs fast logging and OA deadline tracking.
- **Marcus Vance (Fresh Graduate):** Applying for 15–20 entry-level software developer roles weekly. Frustrated by high ghosting rates and lack of pipeline visibility. Needs visual funnel analytics and interview prep notes.
- **Elena Rostova (Experienced Job Seeker):** Balancing a full-time role with selective mid/senior interviews. Frustrated by tracking multi-round technical loops and recruiter calls. Needs interview agenda tracking and compensation comparisons.
- **System Administrator:** Responsible for system uptime, platform security, user management, and aggregate data monitoring. Needs an administrative console with audit logs.

## 4. User Roles & Permissions

| Entity / Resource | Action | Normal User | Administrator |
|---|---|---|---|
| **Auth & Profile** | Register, Login, Update Own Profile | Allowed | Allowed |
| **Own Applications** | Create, Read, Update, Delete (CRUD) | Allowed (isolated to own `user_id`) | Allowed (audit/support) |
| **Other Users' Apps** | Read, Update, Delete | **Denied** (enforced at DB level) | Read-only (support cases) |
| **Documents / Resumes** | Upload, Download, Delete | Allowed (own documents only) | Read-only / delete (abuse) |
| **Interviews & Notes** | Manage interview rounds and notes | Allowed (own applications only) | Read-only |
| **User Directory** | View all platform users | **Denied** | Full access |
| **User Accounts** | Ban / Deactivate / Reset Password | **Denied** | Full access |
| **System Analytics** | View platform-wide aggregate usage | **Denied** | Full access |

## 5. Core Features

- **Account & Identity Management:** Email/password authentication using bcrypt (salt factor 12) and stateless JWTs stored in httpOnly, `SameSite=Strict` secure cookies. User profile management for target roles, locations, and portfolio links.
- **Application Tracking Engine:** Track Company Name, Job Title, Description, Job Type, Work Mode, Location, Salary Range, Application URL, Applied Date, and Target Deadline across 10 lifecycle stages.
- **Document Vault:** Upload, tag, and associate specific PDF resumes (max 5 MB) with individual applications.
- **Interview & Deadline Management:** Record multi-round interview stages (OA, Screening, Technical, Behavioral, HR) with timestamps, interviewer names, meeting links, debrief notes, and outcomes (Pending, Passed, Failed).
- **Search, Filter & Sort:** Instant substring search across company and role names; multi-attribute filtering (Status, Job Type, Work Mode, Date Range); configurable pagination.
- **Analytics Engine:** Visual conversion rates (Applications → Interviews → Offers) and weekly application velocity trends.
- **Admin Controls:** User registry overview, account deactivation/activation controls, and aggregate platform metrics.

## 6. Application Lifecycle

The platform enforces a 10-stage state machine:

```
Wishlist → Applied → Screening → Shortlisted → Interviewing → Offer
                                                                  │
Archived ← Withdrawn ← Rejected ← Accepted ←─────────────────────┘
```

- **Wishlist:** Bookmarked role; application not yet submitted.
- **Applied:** Formal submission recorded; links resume version and submission date.
- **Screening:** Recruiter screening or initial automated review.
- **Shortlisted:** Candidate passed screening and advanced to official loops.
- **Interviewing:** Active multi-round stages; automatically adds nested interview records.
- **Offer:** Formal job offer received; logs compensation and expiration date.
- **Accepted:** Offer signed; captures agreed compensation and start date.
- **Rejected:** Application declined at any stage; records rejection date and feedback.
- **Withdrawn:** Voluntarily withdrawn by the candidate.
- **Archived:** Inactive or dormant record retained for historical metrics.

## 7. Functional Requirements

- **FR-01: User Registration:** User inputs full name, unique email, and strong password (≥ 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character). Returns HTTP 201 on success or HTTP 409 on duplicate email.
- **FR-02: Application Creation:** User creates application with required `company_name`, `job_title`, `job_type`, and `work_mode`. Automatically assigns status `APPLIED` (or chosen default) and associates record with `req.user.id`.
- **FR-03: Interview Scheduling:** User attaches interview rounds (`round_title`, `round_type`, `scheduled_at`, `meeting_link`) to an existing application. System transitions parent application status to `INTERVIEWING`.
- **FR-04: Resume Vault Management:** User uploads a PDF file (strictly validated by magic numbers, max 5 MB). Returns a unique `resume_id` linked to the user account.

## 8. Non-Functional Requirements

- **Performance:** 95% of API requests respond in < 200 ms; database queries on indexed foreign keys execute in < 20 ms; initial frontend FCP ≤ 1.2 s.
- **Security:** TLS 1.3/HTTPS data in transit; bcrypt-hashed passwords; JWT stored in httpOnly secure cookies; Helmet headers (CSP, HSTS, X-Frame-Options); parameterized SQL queries against SQL injection.
- **Scalability & Reliability:** Stateless Express API layer; 3NF normalized PostgreSQL schema; 99.5% uptime target for MVP.
- **Accessibility & Responsiveness:** WCAG 2.1 Level AA color contrast and semantic HTML; fully responsive across mobile (320px), tablet (641px), and desktop (>1024px).

## 9. Complete User Flows

- **Registration & First Application:** Landing Page → Registration Form → Input Validation → Database User Insertion → Issue JWT Cookie → Dashboard View → Click "Add Application" → Fill Form → Save → Dashboard updates with new record.
- **Interview Tracking Flow:** Applications List → Select Application → Add Interview Round (Type: Technical, Date, Zoom Link) → System saves record and updates status to `INTERVIEWING` → System displays round on the Dashboard "Upcoming Interviews" widget.

## 10. UI/UX Page Specifications

- **Landing Page (`/`):** Hero section, value proposition, feature overview, and primary "Get Started" call-to-action.
- **Auth Pages (`/login`, `/register`):** Single-column card layout, real-time field validation, inline error handling, and loading state spinners.
- **Dashboard (`/dashboard`):** KPI summary cards, upcoming 7-day interview action list, expiring assessment deadlines, and quick-add modal.
- **Applications Page (`/applications`):** Table and Kanban board switcher, search input, filter drawer (Status, Job Type, Work Mode), and pagination controls.
- **Application Detail Page (`/applications/:id`):** Header with company and status badge; tabbed navigation for Overview, Timeline, Interview Rounds, Notes, and Uploaded Documents.
- **Interview Hub (`/interviews`):** Chronological agenda view of all scheduled rounds with direct meeting launch links.
- **Analytics Page (`/analytics`):** Stage conversion funnel charts, weekly velocity bar charts, and date range filters.
- **Admin Dashboard (`/admin`):** Paginated platform user list, account activation/suspension toggles, and system-wide counters.

## 11. Dashboard Requirements

- **Metric Cards:** Total Applications, Active Applications, Interviews Scheduled, Offers Received, Rejections.
- **Upcoming Interviews Widget:** Lists rounds scheduled in the next 7 days in chronological order with date, time, round title, and external meeting URLs.
- **Deadline Action Widget:** Highlights Online Assessments and job closing dates expiring within 5 days.
- **Application Trend Chart:** Visual bar graph illustrating application submission volume over the past 8 weeks.

## 12. Database Schema (PostgreSQL, 3NF)

**Entity relationships**

```
USERS (1) ──< (*) APPLICATIONS (*) >── (1) COMPANIES
  │                    │
  │                    ├──< (*) RESUMES   (via resume_id FK)
  │                    ├──< (*) INTERVIEWS
  │                    └──< (*) NOTES
  └──< (*) RESUMES
  └──< (*) NOTES
```

**Tables**

- **users:** `id` (UUID PK), `email` (VARCHAR UQ), `password_hash` (VARCHAR), `full_name` (VARCHAR), `role` (VARCHAR), `created_at` (TIMESTAMPTZ).
- **companies:** `id` (UUID PK), `name` (VARCHAR UQ), `website` (VARCHAR), `logo_url` (VARCHAR).
- **resumes:** `id` (UUID PK), `user_id` (UUID FK → `users.id`), `file_name` (VARCHAR), `file_url` (VARCHAR), `file_size_bytes` (INT), `uploaded_at` (TIMESTAMPTZ).
- **applications:** `id` (UUID PK), `user_id` (UUID FK → `users.id`), `company_id` (UUID FK → `companies.id`), `resume_id` (UUID FK → `resumes.id`, nullable), `job_title` (VARCHAR), `status` (VARCHAR), `job_type` (VARCHAR), `work_mode` (VARCHAR), `salary_min` (INT), `salary_max` (INT), `applied_date` (DATE), `deadline_date` (DATE).
- **interviews:** `id` (UUID PK), `application_id` (UUID FK → `applications.id`), `round_title` (VARCHAR), `round_type` (VARCHAR), `scheduled_at` (TIMESTAMPTZ), `meeting_link` (VARCHAR), `outcome` (VARCHAR).
- **notes:** `id` (UUID PK), `application_id` (UUID FK → `applications.id`), `user_id` (UUID FK → `users.id`), `content` (TEXT), `created_at` (TIMESTAMPTZ).

## 13. API Endpoint Directory

| Method | Endpoint | Auth | Purpose | Status Codes |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register new user account | 201, 400, 409 |
| POST | `/api/v1/auth/login` | Public | Authenticate user & issue JWT cookie | 200, 400, 401 |
| POST | `/api/v1/auth/logout` | Private | Clear authentication cookie | 200 |
| GET | `/api/v1/auth/me` | Private | Fetch authenticated user profile | 200, 401 |
| GET | `/api/v1/applications` | Private | List applications (search, filter, page) | 200, 401 |
| POST | `/api/v1/applications` | Private | Create a new application record | 201, 400, 422 |
| GET | `/api/v1/applications/:id` | Private | Fetch detailed application record | 200, 403, 404 |
| PUT | `/api/v1/applications/:id` | Private | Update application details / status | 200, 400, 404 |
| DELETE | `/api/v1/applications/:id` | Private | Delete application and cascaded records | 204, 404 |
| POST | `/api/v1/applications/:id/interviews` | Private | Schedule an interview round | 201, 400, 404 |
| PUT | `/api/v1/interviews/:id` | Private | Update interview round details/outcome | 200, 400, 404 |
| POST | `/api/v1/resumes` | Private | Upload a new PDF resume | 201, 400, 413, 415 |
| GET | `/api/v1/analytics/summary` | Private | Get user pipeline analytics & conversions | 200, 401 |
| GET | `/api/v1/admin/users` | Admin | List all registered users | 200, 403 |
| PATCH | `/api/v1/admin/users/:id/status` | Admin | Suspend or activate user account | 200, 403, 404 |

## 14. Technology Stack & Architecture

- **Frontend:** React (Vite), Tailwind CSS, Lucide-React, Axios (configured with interceptors), React Router v6.
- **Backend:** Node.js (LTS), Express.js, Multer (file handling), Helmet, CORS, Cookie-Parser.
- **Database:** PostgreSQL (with connection pooling via `pg` / `pg-promise`).
- **Authentication:** Stateless JWTs stored in httpOnly secure cookies; bcrypt password hashing.
- **Architecture:** 3-tier layered monolith:

```
React Client  --HTTPS/JSON-->  Express Controllers  --DTOs-->  Service Logic  --SQL-->  PostgreSQL
```

## 15. Project Structure

```
careertrack/
├── client/                  # Frontend (React + Vite + Tailwind)
│   └── src/
│       ├── components/      # common/, layout/, dashboard/, applications/
│       ├── context/         # AuthContext.jsx, ToastContext.jsx
│       ├── hooks/           # useApplications.js, useDebounce.js
│       ├── pages/           # Dashboard, Applications, Details, Analytics
│       ├── services/        # api.js (Axios instance)
│       └── App.jsx
└── server/                  # Backend (Node.js + Express)
    ├── config/              # db.js, env.js
    ├── controllers/         # authController, appController, interviewController
    ├── middleware/          # authMiddleware, errorMiddleware, uploadMiddleware
    ├── models/              # userModel, applicationModel, interviewModel
    ├── routes/              # authRoutes, applicationRoutes, interviewRoutes
    ├── services/            # applicationService, fileService
    └── server.js
```

## 16. Roadmap & Release Scope

**MVP (Version 1.0)**

- Full user registration, login, and JWT cookie authentication.
- Application CRUD with 10 lifecycle status transitions.
- Substring search, multi-field filtering, sorting, and pagination.
- Multi-round interview tracking with upcoming reminders on dashboard.
- Single-document PDF resume vault (max 5 MB).
- Conversion metrics and aggregate dashboard cards.
- Basic Admin user directory and status management.

**Version 2.0 (Enhanced)**

- Automated email notifications for deadlines and upcoming rounds via Nodemailer/SendGrid.
- Two-way Google Calendar and Outlook Calendar synchronization.
- Drag-and-drop Kanban pipeline board.
- CSV data export and backup engine.

**Future / Version 3.0 (AI & Automation)**

- AI Resume-to-Job Description keyword matcher and ATS scoring.
- Chrome Extension for 1-click application importing from LinkedIn and Indeed.
- Automated recruiter email ingestion via Gmail/Outlook OAuth.
- AI-driven technical and behavioral interview preparation generator.

## 17. Checklists

**MVP Feature Checklist**

- [ ] Email/password registration with complexity validation.
- [ ] Secure JWT issuance inside httpOnly, `SameSite=Strict` cookies.
- [ ] Protected API routes verifying token validity and user ownership.
- [ ] Full CRUD for job applications linked to authenticated user.
- [ ] Status progression engine matching all 10 stages.
- [ ] Multi-round interview tracking linked to applications.
- [ ] Search and multi-filter operations on application listings.
- [ ] Offset pagination for application listings.
- [ ] PDF resume uploads with magic number validation.
- [ ] Dashboard with KPI cards and upcoming 7-day interview agenda.
- [ ] Basic funnel conversion rate analytics.
- [ ] Admin user-management dashboard.

**Developer Implementation Checklist**

- [ ] **Database:** Run PostgreSQL migrations, create primary/foreign keys, and apply B-tree indexes.
- [ ] **Backend Setup:** Initialize Express server with Helmet, CORS, Cookie-Parser, and rate limiting.
- [ ] **Security:** Build bcrypt hashing utilities and JWT authentication middleware.
- [ ] **Data Layer:** Write parameterized SQL queries across User, Application, Interview, and Resume models.
- [ ] **File Storage:** Configure Multer storage pipeline with 5 MB caps and PDF signature verification.
- [ ] **Frontend Foundation:** Initialize React with Vite and Tailwind CSS; configure React Router.
- [ ] **State & Auth:** Implement AuthContext to manage sessions and handle 401 redirects.
- [ ] **UI Views:** Build Dashboard, Application Table, Kanban, and Application Detail views.
- [ ] **Integration & QA:** Verify IDOR protection, form validation errors, and mobile responsiveness.
- [ ] **Deployment:** Deploy PostgreSQL database (Supabase/Neon), Node.js API (Render/Railway), and React SPA (Vercel). Verify production HTTPS and environment variables.
