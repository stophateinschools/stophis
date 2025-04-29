# Step 1: Build React app
# Base image on top of which the app will run
FROM node:18-alpine AS build-step

# Set the working directory in the container
WORKDIR /app

# Copy package.json into docker image
COPY package.json package-lock.json ./
COPY src/ src/
COPY public/ public/

# Install dependencies
RUN npm install

COPY . .

# Build the application
RUN npm run build

# # Expose the port on which the app will run
EXPOSE 3000

# # Command to run the app
# CMD [ "serve", "-s", "dist" ]

# Step 2: Build an nginx container
FROM nginx:stable-alpine
COPY --from=build-step /app/dist /usr/share/nginx/html
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
