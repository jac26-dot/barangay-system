# 🏛️ Barangay Management System

A full-stack web system for managing barangay records, documents, blotter cases, and officials.

---

## 📁 Project Structure

```
barangay-system/
├── server/                  # Node.js + Express backend
│   ├── config/
│   │   └── database.js      # PostgreSQL / Sequelize config
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth middleware
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── .env                 # Environment variables
│   └── index.js             # Server entry point
│
├── web/                     # React frontend
│   ├── public/
│   └── src/
│       ├── api/
│       │   ├── api.js       # Axios instance
│       │   └── services.js  # All API calls
│       ├── views/
│       │   ├── Dashboard/
│       │   ├── Residents/
│       │   ├── Documents/
│       │   ├── Blotter/
│       │   ├── Officials/
│       │   ├── Users/
│       │   └── Login.js
│       ├── App.js
│       ├── App.css
│       ├── config.js        # App constants
│       └── SiteHeader.js    # Sidebar navigation
│
└── package.json             # Root scripts
```

---

## ⚙️ Setup Instructions

### 1. Requirements
- Node.js v18+
- PostgreSQL v14+
- Git

### 2. Clone and install dependencies

```bash
git clone <your-repo>
cd barangay-system
npm run install-all
```

### 3. Set up PostgreSQL database

Open pgAdmin or psql and run:
```sql
CREATE DATABASE barangay_db;
```

### 4. Configure environment variables

Edit `server/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barangay_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 5. Create the first admin user

After running the server once (tables auto-created), connect to psql and run:
```sql
-- Password will be hashed by the app, so insert via the app's seed or API
```

Or use Postman to POST to `/api/users` after logging in, or add a seed script.

### 6. Run the development server

```bash
npm run dev
```

This starts both:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 🔑 API Endpoints

| Method | Endpoint              | Description            | Auth |
|--------|-----------------------|------------------------|------|
| POST   | /api/auth/login       | Login                  | ❌   |
| GET    | /api/auth/me          | Get current user       | ✅   |
| GET    | /api/dashboard/stats  | Dashboard statistics   | ✅   |
| GET    | /api/residents        | List residents         | ✅   |
| POST   | /api/residents        | Add resident           | Staff|
| PUT    | /api/residents/:id    | Update resident        | Staff|
| DELETE | /api/residents/:id    | Delete resident        | Staff|
| GET    | /api/documents        | List document requests | ✅   |
| POST   | /api/documents        | Create request         | Staff|
| GET    | /api/blotter          | List blotter records   | ✅   |
| POST   | /api/blotter          | Record incident        | Staff|
| GET    | /api/officials        | List officials         | ✅   |
| POST   | /api/officials        | Add official           | Admin|
| GET    | /api/users            | List users             | Admin|
| POST   | /api/users            | Create user            | Admin|

---

## 🚀 Deployment (When Ready)

| Layer    | Platform  | Cost        |
|----------|-----------|-------------|
| Frontend | Vercel    | Free        |
| Backend  | Railway   | ~$5/mo      |
| Database | Supabase  | Free tier   |

---

## 📌 Features

- ✅ Resident Management (CRUD + search + pagination)
- ✅ Document Request & Issuance with auto control numbers
- ✅ Blotter / Incident Recording with case numbers
- ✅ Barangay Officials management
- ✅ User accounts with role-based access (Admin / Staff / Viewer)
- ✅ Dashboard with statistics and charts
- ✅ JWT authentication
- ✅ Clean, responsive UI

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Recharts, React Toastify, Axios
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
