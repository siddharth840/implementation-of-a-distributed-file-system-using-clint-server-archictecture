# Dockerfile for NimbusFS Backend
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create storage nodes
RUN mkdir -p backend/storage/node1 backend/storage/node2 backend/storage/node3

# Expose port
EXPOSE 8000

# Start server
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
