FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including LaTeX
# This will take several minutes on first build
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend application
COPY . .

# Expose port 8000 (Render will use the PORT environment variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run the application
# Render will set the PORT environment variable
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}

