# Stage 1: Build stage
FROM node:18-alpine AS builder
# Use a specific Node.js version, Alpine for smaller image size. Node 18 is LTS.

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Using --only=production can be problematic if build scripts are in devDependencies
# For a TypeScript app, we need devDependencies for the build process.
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript to JavaScript
# The build script 'tsc' should be defined in package.json and rely on tsconfig.json
RUN npm run build
# This will create the 'dist' folder with compiled JS files.

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy build artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the port the app runs on (should match PORT in .env or config)
# The actual port is set by environment variable, but EXPOSE documents it.
EXPOSE 3001

# Command to run the application
# This should use the 'start' script from package.json, which runs 'node dist/server.js'
CMD ["npm", "start"]
