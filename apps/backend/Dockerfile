# Build stage
FROM node:20.11.1-slim AS builder

WORKDIR /app

# Install build dependencies
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

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
ENV PATH="/root/.local/share/pnpm:$PATH"

# Copy package files
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig*.json ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY apps/shared ./apps/shared

# Build the application
RUN pnpm run build:backend

# Production stage
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