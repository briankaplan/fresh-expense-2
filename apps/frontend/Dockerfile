# Build step
FROM node:20-alpine as builder
WORKDIR /app

ARG PNPM_VERSION=8
ARG NODE_VERSION=20

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend/ ./apps/frontend/

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm run build

# Serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 