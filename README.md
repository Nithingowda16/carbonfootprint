# EcoTrack AI - Sustainable Carbon Footprint Tracker

EcoTrack AI is a complete, production-ready SaaS platform that helps individuals understand, track, and reduce their carbon footprint. The application features user authentication, a carbon calculator wizard, an AI recommendation engine, habit simulators, gamification, and an AI chat assistant.

---

## Technical Architecture

* **Frontend**: React (Vite, Tailwind CSS, Chart.js, Lucide Icons, Service Worker PWA).
* **Backend**: Python Flask REST API (SQLAlchemy ORM, JWT authentication, Flask-Limiter, ReportLab PDF exporter).
* **Database**: PostgreSQL (Production) / SQLite (Local development/testing).
* **Testing**: Pytest (unit and integration tests), coverage.
* **Orchestration**: Docker & Docker Compose.

---

## Features

1. **User Authentication**: JWT logins/registrations, secure password hashing, and mock reset tokens.
2. **Calculator**: Daily logged transportation, food diet, home utility electricity, and waste metrics.
3. **Habit Simulator**: Sliders to simulate carbon cuts and immediately view tree equivalents.
4. **Gamification**: Streaks, levels, Green Points, XP rewards, and global leaderboards.
5. **AI Assistant**: Sustainability conversational widget.
6. **PDF Reports**: Styled download containing carbon auditing logs.

---

## Local Setup Instructions

### Backend (Flask API)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   py -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python run.py
   ```
   *The API will be available at `http://localhost:5000/api`*

### Frontend (React Vite)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The client will be available at `http://localhost:5173`*

---

## Running Automated Tests

To execute the test suite (11 unit & integration tests covering auth, calculators, actions, and goals):

```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```

---

## Docker Quickstart

To build and run all services (PostgreSQL, Flask Backend, and React Frontend) together:

```bash
docker-compose up --build
```
* Access the React Client at: `http://localhost`
* Access the Flask API at: `http://localhost:5000`

---

## GitHub Setup & Workflow

1. Create a blank repository on GitHub.
2. Initialize and push the local project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - EcoTrack AI complete production codebase"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ecotrack-ai.git
   git push -u origin main
   ```
3. Use feature branches to submit pull requests:
   ```bash
   git checkout -b feature/new-habit-tips
   git add .
   git commit -m "Add solar panel recommendation tip"
   git push origin feature/new-habit-tips
   ```

---

## Production Deployment Guide

### Database (Neon PostgreSQL)
1. Sign up on [Neon.tech](https://neon.tech) and spin up a new serverless PostgreSQL instance.
2. Copy the Connection String and keep it for the backend environment variables.

### Backend (Render)
1. Connect your GitHub repository to [Render](https://render.com).
2. Choose **Web Service**, set the runtime to **Python 3**, and set the build command to `pip install -r requirements.txt`.
3. Set the start command to `gunicorn run:app` (or install `gunicorn` in requirements).
4. Configure environment variables:
   * `DATABASE_URL`: Your Neon connection string.
   * `SECRET_KEY`: A secure long random string.
   * `JWT_SECRET_KEY`: A secure JWT signature key.

### Frontend (Vercel)
1. Link your repository to [Vercel](https://vercel.com).
2. Set the build command to `npm run build` and output directory to `dist`.
3. Set environment variable `VITE_API_URL` to your Render Web Service URL.
