# Step 1: Use base image with our specific Node version
FROM node:20.11.1-slim AS builder

# Step 2: Set working directory
WORKDIR /app

# Step 3: Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-2 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
ENV PATH="/root/.local/share/pnpm:$PATH"

# Step 5: Copy package files for caching
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig*.json ./

# Step 6: Install dependencies
RUN pnpm install --frozen-lockfile

# Step 7: Copy source code
COPY . .

# Step 8: Build the applications
RUN pnpm run build:backend
RUN pnpm run build:frontend

# Production stage for backend
FROM node:20.11.1-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application and credentials
COPY --from=builder /app/dist/apps/backend ./dist
COPY credentials ./credentials

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]

# Production stage for frontend
FROM nginx:stable-alpine AS frontend

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend application
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 