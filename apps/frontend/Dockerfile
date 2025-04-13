# Build step
FROM node:18-alpine as builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy all workspace files
COPY . .

# Install dependencies
RUN pnpm install

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm run build

# Serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 