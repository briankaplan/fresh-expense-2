# Monitoring Setup Guide

This guide explains how to set up and use the monitoring stack for the Expense Tracking application.

## Prerequisites

- Docker 24.0 or later
- Docker Compose 2.20 or later
- At least 2GB of free memory
- At least 1GB of free disk space

## Components

The monitoring stack consists of the following components:

1. **Prometheus**
   - Time-series database
   - Metrics collection and storage
   - Alerting rules configuration
   - Accessible at [http://localhost:9090](http://localhost:9090)

2. **Grafana**
   - Visualization and dashboarding
   - Alert management
   - User management
   - Accessible at [http://localhost:3000](http://localhost:3000)
   - Default credentials: admin/admin

3. **Node Exporter**
   - System metrics collection
   - Hardware monitoring
   - OS-level metrics
   - Accessible at [http://localhost:9100](http://localhost:9100)

4. **cAdvisor**
   - Container metrics collection
   - Resource usage monitoring
   - Performance analysis
   - Accessible at [http://localhost:8080](http://localhost:8080)

## Setup

1. Run the monitoring setup script:

   ```bash
   ./scripts/setup-monitoring.sh
   ```

2. The script will:
   - Create necessary directories
   - Generate configuration files
   - Start the monitoring stack
   - Verify all services are running

3. Access the services:
   - Prometheus: [http://localhost:9090](http://localhost:9090)
   - Grafana: [http://localhost:3000](http://localhost:3000)
   - Node Exporter: [http://localhost:9100](http://localhost:9100)
   - cAdvisor: [http://localhost:8080](http://localhost:8080)

## Grafana Dashboards

### Default Dashboards

1. **System Overview**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

2. **Container Metrics**
   - Container CPU usage
   - Container memory usage
   - Container network I/O
   - Container disk I/O

3. **Application Metrics**
   - Request latency
   - Error rates
   - Throughput
   - Database connections

### Creating Custom Dashboards

1. Log in to Grafana
2. Click "Create" > "Dashboard"
3. Add panels using Prometheus queries
4. Save the dashboard

## Alerting

### Setting Up Alerts

1. In Grafana, go to "Alerting" > "Alert rules"
2. Click "New alert rule"
3. Configure:
   - Query
   - Condition
   - Evaluation interval
   - Notification channel

### Notification Channels

1. Email
2. Slack
3. PagerDuty
4. Webhook

## Maintenance

### Updating the Stack

1. Stop the current stack:

   ```bash
   cd monitoring
   docker-compose -f docker-compose.monitoring.yml down
   ```

2. Pull latest images:

   ```bash
   docker-compose -f docker-compose.monitoring.yml pull
   ```

3. Start the stack:

   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

### Backup and Restore

1. Backup Grafana dashboards:

   ```bash
   docker exec -it grafana grafana-cli admin backup-dashboards
   ```

2. Backup Prometheus data:

   ```bash
   docker exec -it prometheus promtool tsdb backup /prometheus
   ```

3. Restore from backup:

   ```bash
   docker exec -it grafana grafana-cli admin restore-dashboards <backup-file>
   docker exec -it prometheus promtool tsdb restore /prometheus <backup-dir>
   ```

## Troubleshooting

### Common Issues

1. **Services not starting**
   - Check Docker logs: `docker-compose -f docker-compose.monitoring.yml logs`
   - Verify port availability
   - Check system resources

2. **Metrics not showing**
   - Verify Prometheus targets
   - Check scrape configurations
   - Verify network connectivity

3. **Grafana login issues**
   - Reset admin password: `docker exec -it grafana grafana-cli admin reset-admin-password <new-password>`
   - Check user permissions
   - Verify database connection

### Performance Optimization

1. Adjust scrape intervals
2. Configure retention policies
3. Optimize queries
4. Scale resources as needed
