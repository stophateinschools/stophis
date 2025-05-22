# Use an official Python runtime as a parent image
FROM python:3.13.1-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# Install dependencies for pyppeteer/Chromium
RUN apt-get update && apt-get install -y postgresql postgresql-client \
    libpq-dev gcc build-essential \
    wget gnupg ca-certificates curl unzip fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    libgbm1 libgtk-3-0 libxshmfence1 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy only reuqirements.txt first to leverage Docker cache
COPY ../requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Force pyppeteer to download Chromium at build time
ENV PYPPETEER_HOME=/app/.pyppeteer
RUN python -c "from pyppeteer import chromium_downloader; chromium_downloader.download_chromium()"

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 5000

# Create a user and switch to it (needed for tox to run pg_ctl)
RUN useradd -ms /bin/bash appuser
RUN chown -R appuser:appuser /app/.pyppeteer
USER appuser

# Run using gunicorn
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]