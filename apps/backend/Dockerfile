# Build step
FROM node:20-alpine as builder
WORKDIR /app

ARG PNPM_VERSION=8
ARG NODE_VERSION=20

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy package files
COPY apps/backend/package.json ./
COPY package.json ./package.json
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install

# Copy source code
COPY apps/backend/ ./

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

ARG PNPM_VERSION=8
ARG NODE_VERSION=20

# Install runtime dependencies
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 