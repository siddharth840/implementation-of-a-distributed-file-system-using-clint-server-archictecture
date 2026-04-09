# Dockerfile for NimbusFS Backend
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create storage base directory
RUN mkdir -p storage

# Default port
EXPOSE 8005

# Start server (can be overridden by command in Railway/Docker-compose)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
