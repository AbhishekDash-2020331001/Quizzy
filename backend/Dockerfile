# --- STAGE 1: Build Stage ---
# Use a Python base image that includes essential build tools and common libraries.
# python:3.12-slim-bookworm is a good choice for Python 3.12 on Debian 12 (Bookworm).
# This provides a balance between image size and necessary pre-installed tools.
FROM python:3.12-slim-bookworm AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.7.1

# Set the working directory for the application inside the container
WORKDIR /app

# Install system dependencies required for `mysqlclient` and potentially `numpy`
# - build-essential: Provides gcc, g++, make, etc. for compiling C extensions.
# - pkg-config: Used by mysqlclient to locate MySQL client libraries.
# - libmariadb-dev-compat: MariaDB client development files, compatible with MySQL.
# - python3-dev: Needed for some Python C extensions.
# - zlib1g-dev: A common dependency for many Python packages.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libmariadb-dev-compat \
    python3-dev \
    zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install Python dependencies
# This step is done separately to leverage Docker's caching.
# If only code changes, this step doesn't re-run.
COPY requirements.txt .
RUN pip install -r requirements.txt

# --- STAGE 2: Run Stage ---
# Use a smaller base image for the final production image to reduce size.
# This image will only contain the runtime essentials and your application.
FROM python:3.12-slim-bookworm

# Set environment variables for the runtime
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Copy the entire Python environment from the builder stage
# This ensures that all dependencies, including executables like 'uvicorn',
# are correctly placed in the PATH.
COPY --from=builder /usr/local /usr/local
# Copy your application code
COPY . .

# Expose the port your FastAPI application will listen on
EXPOSE 8000

# Command to run your FastAPI application using Uvicorn
# Replace `main:app` with the actual path to your FastAPI application instance
# (e.g., if your app is in `app/main.py` and the FastAPI instance is `app`, use `app.main:app`)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]