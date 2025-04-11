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
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Copy package files for caching
COPY package*.json ./
COPY nx.json tsconfig*.json ./

# Step 5: Install dependencies with specific npm version
RUN npm install -g npm@10.2.4
RUN npm install

# Step 6: Copy source code
COPY . .

# Step 7: Build the backend application
RUN npm run build:backend

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

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install -g npm@10.2.4
RUN npm install --omit=dev

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
FROM node:20.11.1-slim AS frontend

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install -g npm@10.2.4
RUN npm install --omit=dev

# Copy built frontend application
COPY --from=builder /app/dist/apps/frontend ./dist

EXPOSE 4200

CMD ["npm", "run", "start:frontend"] 