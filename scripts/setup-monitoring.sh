#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to log errors
error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to log warnings
warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check prerequisites
log "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed"
    exit 1
fi

# Create monitoring directory
MONITORING_DIR="monitoring"
mkdir -p "$MONITORING_DIR"

# Create Prometheus configuration
log "Setting up Prometheus..."
cat > "$MONITORING_DIR/prometheus.yml" << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
EOF

# Create Grafana datasource configuration
log "Setting up Grafana..."
mkdir -p "$MONITORING_DIR/grafana/provisioning/datasources"
cat > "$MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create Docker Compose file for monitoring
log "Creating Docker Compose file for monitoring..."
cat > "$MONITORING_DIR/docker-compose.monitoring.yml" << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "3000:3000"
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
EOF

# Create monitoring dashboard
log "Creating monitoring dashboard..."
mkdir -p "$MONITORING_DIR/grafana/provisioning/dashboards"
cat > "$MONITORING_DIR/grafana/provisioning/dashboards/dashboards.yml" << EOF
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Start monitoring stack
log "Starting monitoring stack..."
cd "$MONITORING_DIR"
docker-compose -f docker-compose.monitoring.yml up -d

# Check if services are running
log "Checking if monitoring services are running..."
sleep 10

if docker ps | grep -q "prometheus" && \
   docker ps | grep -q "grafana" && \
   docker ps | grep -q "node-exporter" && \
   docker ps | grep -q "cadvisor"; then
    log "Monitoring stack is running successfully!"
    echo "Access the following services:"
    echo "- Prometheus: http://localhost:9090"
    echo "- Grafana: http://localhost:3000 (default credentials: admin/admin)"
    echo "- Node Exporter: http://localhost:9100"
    echo "- cAdvisor: http://localhost:8080"
else
    error "Some monitoring services failed to start"
    exit 1
fi 