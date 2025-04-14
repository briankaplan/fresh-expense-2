# Build stage
FROM node:20-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Set working directory
WORKDIR /app/apps/frontend

# Copy root configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json /app/
COPY tsconfig.base.json /app/

# Copy shared libraries
COPY libs /app/libs

# Copy frontend configuration files and source code
COPY apps/frontend/package.json ./
COPY apps/frontend/tsconfig.json ./
COPY apps/frontend/tsconfig.node.json ./
COPY apps/frontend/src ./src
COPY apps/frontend/public ./public
COPY apps/frontend/index.html ./
COPY apps/frontend/vite.config.ts ./
COPY apps/frontend/vite-env.d.ts ./src/

# Build arguments
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_SECRET
ARG VITE_JWT_STORAGE_KEY

# Environment variables from build args
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_SECRET=$VITE_GOOGLE_CLIENT_SECRET
ENV VITE_JWT_STORAGE_KEY=$VITE_JWT_STORAGE_KEY

# Install dependencies and build
RUN cd /app && pnpm install --frozen-lockfile
RUN cd /app && pnpm nx build frontend --output-path=dist

# Production image
FROM nginx:1.25-alpine as production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 