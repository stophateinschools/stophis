# Use an official Python runtime as a parent image
FROM python:3.13.1-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# Install dependencies for pyppeteer/Chromium
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates curl unzip fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    libgbm1 libgtk-3-0 libxshmfence1 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy only the Pipfile and Pipfile.lock first to leverage Docker cache
# Always update the Pipfile.lock before building the image
COPY ../Pipfile ../Pipfile.lock ./

# Install pipenv and sync the dependencies from Pipfile.lock
RUN pip install pipenv && pipenv install --deploy --system

# Force pyppeteer to download Chromium at build time
ENV PYPPETEER_HOME=/app/.pyppeteer
RUN python -c "from pyppeteer import chromium_downloader; chromium_downloader.download_chromium()"

# Copy the rest of the application code
COPY . .

# Expose port (Gunicorn default port)
EXPOSE 8000

# Run using gunicorn
CMD ["/bin/sh", "-c", "\
  if [ \"$FLASK_ENV\" = 'development' ]; then \
    echo 'Running in development mode'; \
    pip install watchdog; \
    watchmedo auto-restart --directory=./ --pattern='*.py' --recursive -- \
      gunicorn --bind 0.0.0.0:5000 --reload server.wsgi:app; \
  else \
    echo 'Running in production mode'; \
    gunicorn --bind 0.0.0.0:5000 server.wsgi:app; \
  fi"]