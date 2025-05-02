# Step 1: Build React app
# Base image on top of which the app will run
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json into docker image
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build the application
RUN npm run build

# # Expose the port on which the app will run
EXPOSE 3000

# # Command to run the app
CMD [ "npm", "run", "dev" ]
