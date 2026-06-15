# EcoTrack AI - Sustainable Carbon Footprint Tracker

EcoTrack AI is a complete, production-ready SaaS platform that helps individuals understand, track, and reduce their carbon footprint. The application features user authentication, a carbon calculator wizard, an AI recommendation engine, habit simulators, gamification, and an AI chat assistant.

---

## 📋 Submission Overview

### 1. Chosen Vertical
* **Vertical**: Sustainability, Climate Tech, and Climate Action.
* **Problem Focus**: Individuals want to contribute to climate action but struggle to understand their personal impact, calculate daily actions accurately, and sustain carbon-reduction habits over time. EcoTrack AI solves this through low-friction daily logging, instant simulation of habit improvements, gamified social challenges, and localized AI chatbot coaching.

### 2. Approach and Logic
* **Calculation Engine**: The calculation formulas map user inputs directly to carbon footprints in kilograms of $CO_2$ ($kgCO_2$) based on EPA (Environmental Protection Agency) standards:
  - **Transportation**: $Distance \times Factor_{VehicleType}$ (e.g., Petrol: $0.21 kg/km$, Diesel: $0.19 kg/km$, Electric: $0.05 kg/km$, Public Transport: $0.03 kg/km$).
  - **Home Electricity**: $kWh \times 0.38 kg/kWh$.
  - **Diet / Food**: Feeding habits (e.g., High Meat: $8.0 kg/day$, Vegetarian: $2.5 kg/day$, Vegan: $1.5 kg/day$).
  - **Waste**: $Weight \times Factor_{Recycling}$ (e.g., General Waste: $0.5 kg$, Recycled: $0.1 kg$).
* **Gamification Loop**: Translates emission savings and daily logs into Experience Points (XP) and Levels. Users unlock achievements and participate in global monthly challenges to encourage continuous participation.
* **Unified Single-Service Execution**: Rather than deploying the client and API on separate hosting providers (increasing billing costs and introducing CORS latency), our code bundles the React client directly inside the Flask server. Flask acts as a reverse proxy, checking if a path matches a static asset (e.g. `/assets/*`) and falling back to the client-side router `index.html` if it doesn't match API endpoints.

### 3. How the Solution Works
1. **Onboarding**: Users register and log in securely. The system initializes their carbon logs and active streaks.
2. **Logging**: Users fill in simple daily entries for their activities (electricity, travel, meals, waste).
3. **Analytics**: The dashboard converts logs into interactive doughnut charts (via Chart.js) and highlights emission-heavy categories.
4. **Reduction & Simulation**: Users slide parameters in the Habit Simulator to see how actions (e.g., cutting meat, switching to public transport) translate directly into trees planted.
5. **Actionable Recommendations**: Custom, localized recommendations are generated dynamically targeting the user's highest emission sectors.
6. **Chatbot Support**: Users can chat with the offline-first AI assistant to ask questions like "How can I reduce waste?" or "Explain EPA emission factors".
7. **Reporting**: The ReportLab engine compiles all historical data and formats a structural audit PDF report.

### 4. Assumptions Made
* **Local Storage Cache**: We assume local storage is available in the user's browser to store JWT authorization tokens.
* **EPA Emission Factors**: Constant averages are used for factors (such as the standard US/EU electricity grid carbon intensity of $0.38 kg/kWh$). In a production environment, this would resolve dynamically by zip code.
* **PostgreSQL / SQLite Interoperability**: The backend is built to run on SQLite locally for testing and seamlessly scale to serverless PostgreSQL (e.g., Neon.tech) in production by reading `DATABASE_URL` environment variables.

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
