# Development stage
FROM python:3.9-slim as development

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Install development tools
RUN pip install black

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 8000

# Run the application - Allow for reload during development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]