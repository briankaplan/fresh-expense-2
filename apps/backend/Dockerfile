# Use Node.js 20 as the base image
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the backend
RUN pnpm build backend

# Expose the port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start", "backend"] 