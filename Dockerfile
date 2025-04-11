FROM node:18.18.0 as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps
RUN npm install -g typescript @nestjs/cli
RUN npm install --save \
    @aws-sdk/client-s3 \
    @aws-sdk/s3-request-presigner \
    sharp \
    pdf-lib \
    puppeteer \
    tesseract.js \
    winston \
    jsdom \
    pdf-img-convert \
    pdfkit \
    xlsx \
    openai

# Copy source code
COPY apps ./apps
COPY libs ./libs

# Build the applications
RUN npx nx build backend
RUN npx nx build frontend

# Production image
FROM node:18.18.0-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Expose ports
EXPOSE 3000 4200

# Set environment variables
ENV NODE_ENV=production

# Start both services
CMD ["npm", "start"] 