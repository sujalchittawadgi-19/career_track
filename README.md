# CareerTrack 🚀

> **Job & Internship Application Management Platform**  
> A centralized, production-grade web workspace for tracking, managing, and analyzing job and internship applications throughout the recruitment lifecycle.

---

## ✨ Features

- **Pipeline & Application Management:** Track applications across a structured 10-stage lifecycle (*Wishlist, Applied, Screening, Shortlisted, Interviewing, Offer, Accepted, Rejected, Withdrawn, Archived*).
- **Kanban & Table Views:** Switch seamlessly between visual drag-and-drop boards and dense data tables.
- **Milestone & Interview Scheduler:** Log interview rounds (Online Assessments, Screening, Technical, Behavioral, HR) with meeting links, debrief notes, and status.
- **Document & Resume Vault:** Upload and associate specific resume versions with applications.
- **Analytics & Funnel Metrics:** Visual application velocity, stage conversion rates, and response metrics.
- **Secure Authentication:** Stateless JWT stored in `httpOnly` secure cookies, bcrypt password hashing, and role-based permissions (User / Admin).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS & Lucide Icons
- **HTTP Client:** Axios (configured with credentials and interceptors)

### Backend
- **Runtime:** Node.js & Express
- **Database:** PostgreSQL (with connection pooling via `pg`)
- **Security:** Helmet, CORS, Rate Limiting, Cookie Parser, JSON Web Tokens (JWT), Bcrypt
- **File Uploads:** Multer (with MIME & magic-number validations)

---

## 📁 Project Structure

```
career_track/
├── client/                 # React + Vite frontend
│   ├── src/                # Components, pages, hooks, services, context
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend API
│   ├── config/             # Database connection & env config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, validation, error handling
│   ├── migrations/         # PostgreSQL schema & seeds
│   ├── routes/             # RESTful API endpoints
│   ├── scripts/            # Database initialization scripts
│   └── package.json
├── CareerTrack_PRD.md      # Detailed Product Requirements Document
├── package.json            # Root workspace scripts (concurrently)
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or later)
- **PostgreSQL** (v14 or later)
- **npm** or **yarn**

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/sujalchittawadgi-19/career_track.git
cd career_track
npm run install:all
```

### 3. Environment Configuration

#### Backend (`server/.env`)
Copy the example file and update with your PostgreSQL credentials:
```bash
cp server/.env.example server/.env
```
Key variables:
- `PORT=5000`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=your_postgres_password`
- `DB_NAME=careertrack`
- `JWT_SECRET=your_super_secret_jwt_key`

#### Frontend (`client/.env`)
Copy the frontend environment template:
```bash
cp client/.env.example client/.env
```

### 4. Database Setup
Initialize the PostgreSQL database schema and seed data:
```bash
npm run db:init
```

### 5. Running the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
