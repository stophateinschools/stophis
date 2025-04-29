# Build React app
FROM node:18-alpine as client-build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Python app setup
FROM python:3.13.1-slim as server
WORKDIR /app
COPY Pipfile* ./
RUN pip install pipenv && pipenv install --deploy --system
COPY . .

# Move React build into Flask/Nginx
FROM nginx:stable-alpine
COPY --from=client-build /app/dist /app/client/dist
COPY /client/nginx.default.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["sh", "-c", "nginx && gunicorn --bind 0.0.0.0:5000 server.wsgi:app"]