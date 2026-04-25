# NearBy Installation and Run Guide

This guide explains how to run both the backend (Django) and frontend (React + Vite) locally.

## 1. Prerequisites

Make sure these are installed:

- Python 3.10+ (recommended)
- Node.js 18+ and npm
- MySQL Server
- Git (optional, if cloning)

## 2. Clone the Project

```bash
git clone https://github.com/rhythmplayz/NearBy.git
cd NearBy
```

If you already have the project, move to the project root folder (`NearBy/`).

## 3. Backend Setup (Django)

Backend path: `backend/nearby/`

### 3.1 Create and activate virtual environment

From the project root:

Windows (PowerShell):

```powershell
cd backend\nearby
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
cd backend/nearby
python3 -m venv .venv
source .venv/bin/activate
```

### 3.2 Install Python dependencies

```bash
pip install -r ..\requirements.txt
```

If you are on macOS/Linux, use:

```bash
pip install -r ../requirements.txt
```

### 3.3 Database setup

For local development, the backend now uses SQLite by default, so no separate database setup is required.

If you want to use MySQL instead, set these environment variables before running the server:

```powershell
$env:NEARBY_DB_ENGINE = "django.db.backends.mysql"
$env:NEARBY_DB_NAME = "nearby"
$env:NEARBY_DB_USER = "root"
$env:NEARBY_DB_PASSWORD = "your-password"
$env:NEARBY_DB_HOST = "localhost"
$env:NEARBY_DB_PORT = "3306"
```

Then create the MySQL database before migrations:

```sql
CREATE DATABASE nearby;
```

### 3.4 Run migrations

```bash
python manage.py migrate
```

### 3.5 (Optional) Create admin user

```bash
python manage.py createsuperuser
```

### 3.6 Start backend server

```bash
python manage.py runserver
```

Backend will run at:

- `http://127.0.0.1:8000/`

Keep this terminal open.

## 4. Frontend Setup (React + Vite)

Open a new terminal and go to frontend folder from project root.

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

- `http://localhost:5173/`

## 5. Run Both Together

- Terminal 1: backend (`python manage.py runserver`)
- Terminal 2: frontend (`npm run dev`)

The frontend is already allowed by backend CORS settings for:

- `http://localhost:5173`
- `http://localhost:3000`

## 6. Common Troubleshooting

### Port already in use

Run backend on another port:

```bash
python manage.py runserver 8001
```

Run frontend on another port:

```bash
npm run dev -- --port 5174
```

### MySQL connection error

- Verify MySQL service is running.
- Verify `DATABASES` credentials in `settings.py`.
- Make sure database `nearby` exists.

### Virtual environment activation blocked on PowerShell

Run once in PowerShell (as current user):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate virtual environment again.
