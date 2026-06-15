FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=production
ENV PORT=5000

# Run Flask
CMD ["python", "run.py"]
