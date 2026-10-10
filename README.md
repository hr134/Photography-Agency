# Photography Agency & Full-Stack Platform

A complete photography agency and developer portfolio web application featuring an interactive visual showcase, online booking system, client dashboard, admin management portal, and Flask REST API backend.

## 📁 Project Structure

```
├── my-next-project/          # Frontend application (Next.js, TypeScript, Tailwind CSS)
│   ├── src/app/              # App router (Photography agency, booking, portfolio, admin)
│   ├── public/               # Public assets & interactive scroll frame sequence
│   └── ...
├── my-flask-backend/         # Backend REST API (Flask, SQLAlchemy, JWT Auth)
│   ├── app/                  # Application modules (routes, models, services)
│   ├── migrations/           # Database migration files
│   ├── requirements.txt      # Python dependencies
│   └── ...
├── Our package full.txt      # Agency package specifications & tiers
└── Plan Text Document.txt    # Project specifications and architecture notes
```

## 🚀 Quick Start

### 1. Backend (Flask)
```bash
cd my-flask-backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python check_db.py
python app.py
```
Backend runs on `http://localhost:5000`.

### 2. Frontend (Next.js)
```bash
cd my-next-project
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

## 🛠️ Key Features
- **Visual Storytelling & Scroll Animation**: High-performance canvas-based image frame sequence.
- **Agency Booking System**: Package selection, date scheduling, customizable options, discounts.
- **Client & Admin Portals**: Contract management, invoice generation (PDF), status tracking, email alerts.
- **Secure Backend API**: JWT authentication, role-based authorization, SQLite/SQLAlchemy database.
