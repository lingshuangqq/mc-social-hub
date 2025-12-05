# Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Backend
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies (if any, e.g. for postgres)
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# Expose port
EXPOSE 8080

# Run app
# Note: Cloud Run expects port 8080 by default
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
