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

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml nx.json tsconfig.base.json ./
COPY apps/backend/project.json ./apps/backend/
COPY apps/backend/tsconfig.app.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend/src ./apps/backend/src
COPY libs ./libs

# Build the application
RUN pnpm nx build backend

# Production stage
FROM node:20-slim as production

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    libpixman-1-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/dist/apps/backend ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Install production dependencies only
RUN corepack enable && \
    corepack prepare pnpm@8.15.4 --activate && \
    pnpm install --prod --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Build arguments
ARG JWT_SECRET
ARG ENCRYPTION_KEY
ARG GMAIL_CLIENT_ID_1
ARG GMAIL_CLIENT_SECRET_1
ARG GMAIL_REFRESH_TOKEN_1
ARG GMAIL_CLIENT_ID_2
ARG GMAIL_CLIENT_SECRET_2
ARG GMAIL_REFRESH_TOKEN_2
ARG GMAIL_CLIENT_ID_3
ARG GMAIL_CLIENT_SECRET_3
ARG GMAIL_REFRESH_TOKEN_3
ARG GMAIL_CLIENT_ID_4
ARG GMAIL_CLIENT_SECRET_4
ARG GMAIL_REFRESH_TOKEN_4
ARG GMAIL_CLIENT_ID_5
ARG GMAIL_CLIENT_SECRET_5
ARG GMAIL_REFRESH_TOKEN_5
ARG PROD_HUGGINGFACE_API_KEY
ARG HUGGINGFACE_API_KEY
ARG SENDGRID_API_KEY

# Environment variables from build args
ENV JWT_SECRET=$JWT_SECRET
ENV ENCRYPTION_KEY=$ENCRYPTION_KEY
ENV GMAIL_CLIENT_ID_1=$GMAIL_CLIENT_ID_1
ENV GMAIL_CLIENT_SECRET_1=$GMAIL_CLIENT_SECRET_1
ENV GMAIL_REFRESH_TOKEN_1=$GMAIL_REFRESH_TOKEN_1
ENV GMAIL_CLIENT_ID_2=$GMAIL_CLIENT_ID_2
ENV GMAIL_CLIENT_SECRET_2=$GMAIL_CLIENT_SECRET_2
ENV GMAIL_REFRESH_TOKEN_2=$GMAIL_REFRESH_TOKEN_2
ENV GMAIL_CLIENT_ID_3=$GMAIL_CLIENT_ID_3
ENV GMAIL_CLIENT_SECRET_3=$GMAIL_CLIENT_SECRET_3
ENV GMAIL_REFRESH_TOKEN_3=$GMAIL_REFRESH_TOKEN_3
ENV GMAIL_CLIENT_ID_4=$GMAIL_CLIENT_ID_4
ENV GMAIL_CLIENT_SECRET_4=$GMAIL_CLIENT_SECRET_4
ENV GMAIL_REFRESH_TOKEN_4=$GMAIL_REFRESH_TOKEN_4
ENV GMAIL_CLIENT_ID_5=$GMAIL_CLIENT_ID_5
ENV GMAIL_CLIENT_SECRET_5=$GMAIL_CLIENT_SECRET_5
ENV GMAIL_REFRESH_TOKEN_5=$GMAIL_REFRESH_TOKEN_5
ENV PROD_HUGGINGFACE_API_KEY=$PROD_HUGGINGFACE_API_KEY
ENV HUGGINGFACE_API_KEY=$HUGGINGFACE_API_KEY
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"] 