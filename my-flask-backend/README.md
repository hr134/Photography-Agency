# Photography Agency & Developer Portfolio - Flask Backend API

Backend REST API service for the Photography Agency and Developer Portfolio website.

## Features
- **Authentication**: JWT-based auth (User & Admin roles, registration, login, password reset)
- **Bookings Management**: Create, update, cancel bookings with package details
- **Admin Dashboard**: Manage bookings, packages, discounts, messages, and portfolio data
- **Email Notifications**: Confirmation & status update emails via Flask-Mail
- **PDF Generation**: Invoices and contract generation via ReportLab / xhtml2pdf

## Tech Stack
- Python 3 / Flask
- Flask-SQLAlchemy (SQLite database)
- Flask-Migrate (Alembic)
- Flask-JWT-Extended
- Flask-CORS
- Flask-Mail

## Getting Started

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   Copy `.env.example` to `.env` and fill in your secrets and email credentials:
   ```bash
   cp .env.example .env
   ```

4. **Initialize database:**
   ```bash
   python check_db.py
   python seed.py
   ```

5. **Run the server:**
   ```bash
   python app.py
   ```
   The backend server runs on `http://localhost:5000`.
