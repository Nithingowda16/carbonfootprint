# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Build frontend with relative API path
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Create production container with Flask backend and built Frontend
FROM python:3.11-slim
WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy the built frontend static files from Stage 1 into the folder Flask expects
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (Render/Railway will map this dynamically via PORT env variable)
EXPOSE 5000

# Set environment variables for production
ENV FLASK_APP=backend/run.py
ENV FLASK_ENV=production

# Start Flask backend using Gunicorn, binding to the dynamic port env variable
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT --chdir backend run:app"]
