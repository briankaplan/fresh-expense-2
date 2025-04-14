# Deployment Scenarios

This document outlines various deployment scenarios for the Expense Tracking application.

## Local Development

### Local Development Prerequisites

- Node.js 20.11.1 or later
- pnpm 8.15.4 or later
- MongoDB 7.0 or later
- Docker 24.0 or later (optional)

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/expense-app.git
   cd expense-app
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development servers:

   ```bash
   pnpm dev
   ```

## Docker Development

### Docker Development Prerequisites

- Docker 24.0 or later
- Docker Compose 2.20 or later

### Docker Development Setup

1. Build and start the containers:

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. Access the services:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3001](http://localhost:3001)
   - MongoDB: mongodb://localhost:27017/expense-app

## Production Deployment

### Production Deployment Prerequisites

- Docker 24.0 or later
- Docker Compose 2.20 or later
- Domain name and SSL certificates
- MongoDB Atlas account

### Production Deployment Setup

1. Configure environment variables:

   ```bash
   cp apps/backend/config/production.env apps/backend/.env
   cp apps/frontend/config/production.env apps/frontend/.env
   ```

2. Update the configuration files with your production values.

3. Build and start the containers:

   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

4. Set up Nginx reverse proxy:

   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/expense-app
   sudo ln -s /etc/nginx/sites-available/expense-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Kubernetes Deployment

### Kubernetes Deployment Prerequisites

- Kubernetes cluster
- kubectl configured
- Helm 3.0 or later

### Kubernetes Deployment Setup

1. Create namespace:

   ```bash
   kubectl create namespace expense-app
   ```

2. Install MongoDB:

   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm install mongodb bitnami/mongodb --namespace expense-app
   ```

3. Deploy the application:

   ```bash
   kubectl apply -f k8s/
   ```

4. Access the services:
   - Frontend: [http://your-domain.com](http://your-domain.com)
   - Backend: [http://api.your-domain.com](http://api.your-domain.com)

## CI/CD Pipeline

### CI/CD Pipeline Prerequisites

- GitHub repository
- GitHub Actions enabled
- Docker Hub or GitHub Container Registry account

### CI/CD Pipeline Setup

1. Configure repository secrets:
   - DOCKERHUB_USERNAME
   - DOCKERHUB_TOKEN
   - PROD_JWT_SECRET
   - PROD_MONGODB_URI
   - PROD_API_URL

2. Push to main branch to trigger deployment:

   ```bash
   git push origin main
   ```

3. Monitor the deployment in GitHub Actions.

## Monitoring Setup

### Monitoring Setup Prerequisites

- Prometheus
- Grafana
- Node Exporter
- cAdvisor

### Monitoring Setup Configuration

1. Start the monitoring stack:

   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. Access the services:
   - Prometheus: [http://localhost:9090](http://localhost:9090)
   - Grafana: [http://localhost:3000](http://localhost:3000)
   - Node Exporter: [http://localhost:9100](http://localhost:9100)
   - cAdvisor: [http://localhost:8080](http://localhost:8080)

## Backup and Recovery

### Backup and Recovery Prerequisites

- MongoDB backup tools
- Object storage (e.g., S3, GCS)

### Backup and Recovery Configuration

1. Configure backup schedule:

   ```bash
   crontab -e
   ```

2. Add backup job:

   ```bash
   0 0 * * * /path/to/backup-script.sh
   ```

3. Test recovery:

   ```bash
   ./scripts/restore-backup.sh <backup-file>
   ```

## Scaling Strategies

### Horizontal Scaling Configuration

1. Add more instances:

   ```bash
   kubectl scale deployment frontend --replicas=3
   kubectl scale deployment backend --replicas=3
   ```

2. Configure load balancer:

   ```bash
   kubectl apply -f k8s/load-balancer.yaml
   ```

### Vertical Scaling Configuration

1. Increase resource limits:

   ```bash
   kubectl edit deployment frontend
   kubectl edit deployment backend
   ```

2. Monitor resource usage:

   ```bash
   kubectl top pods
   ```

## Security Considerations

### Network Security Configuration

1. Configure firewall rules:

   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. Set up SSL/TLS:

   ```bash
   certbot --nginx -d your-domain.com
   ```

### Application Security Configuration

1. Enable security headers:

   ```bash
   sudo nano /etc/nginx/conf.d/security-headers.conf
   ```

2. Configure rate limiting:

   ```bash
   sudo nano /etc/nginx/conf.d/rate-limiting.conf
   ```

## Maintenance Procedures

### Regular Maintenance Tasks

1. Update dependencies:

   ```bash
   pnpm update
   ```

2. Apply security patches:

   ```bash
   sudo apt update && sudo apt upgrade
   ```

### Emergency Maintenance Procedures

1. Rollback deployment:

   ```bash
   kubectl rollout undo deployment/frontend
   kubectl rollout undo deployment/backend
   ```

2. Restore from backup:

   ```bash
   ./scripts/emergency-restore.sh
   ```
