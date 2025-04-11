# Technical Context

## Architecture Overview

### Frontend Architecture

- **Framework**: React with TypeScript
- **State Management**: React Query + Context API
- **UI Framework**: Material-UI (MUI)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Backend Architecture

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudflare R2
- **Queue System**: Bull
- **Testing**: Jest + Supertest

### Backend Services

- API Gateway Service
- Authentication Service
- User Management Service
- Data Processing Service

### Frontend Components

- React Components
- State Management
- Routing System
- API Integration

### Database Design

- User Schema
- Transaction Schema
- Settings Schema
- Audit Schema

## Testing Strategy

### Unit Testing

- Component Tests
- Service Tests
- Utility Tests
- Model Tests

### Integration Testing

- API Tests
- Database Tests
- Service Integration
- External Services

### E2E Testing

- User Flows
- Critical Paths
- Performance Tests
- Security Tests

## Development Process

### Code Standards

- TypeScript Guidelines
- React Best Practices
- Testing Requirements
- Documentation Rules

### Version Control

- Branch Strategy
- Commit Guidelines
- Review Process
- Release Flow

### CI/CD Pipeline

- Build Process
- Test Automation
- Deployment Stages
- Monitoring Setup

## Infrastructure

### Cloud Services

- AWS Configuration
- Storage Solutions
- Database Clusters
- Cache Systems

### Security Measures

- Authentication
- Authorization
- Data Encryption
- Access Control

### Monitoring

- Performance Metrics
- Error Tracking
- Usage Analytics
- Health Checks

## Development Tools

### IDE Setup

- VS Code Extensions
- Debugging Tools
- Code Formatters
- Linting Rules

### Build Tools

- Webpack Config
- Babel Setup
- TypeScript Config
- Asset Pipeline

### Testing Tools

- Jest Configuration
- Cypress Setup
- Test Helpers
- Mock Data

## Documentation

### API Docs

- OpenAPI Spec
- Endpoint Details
- Authentication
- Error Handling

### Code Docs

- JSDoc Standards
- Component Docs
- Service Docs
- Type Definitions

### User Guides

- Setup Guide
- Development Guide
- Testing Guide
- Deployment Guide

## Core Services

### Receipt Bank Service

- **Purpose**: Manages receipt storage and processing
- **Key Features**:
  - OCR processing
  - Automatic matching
  - Storage management
  - Metadata extraction
- **Dependencies**:
  - OCR Service
  - R2 Service
  - MongoDB

### Report Service

- **Purpose**: Handles report generation
- **Key Features**:
  - Template management
  - Scheduled reports
  - Multiple formats
  - Email delivery
- **Dependencies**:
  - PDF Service
  - Email Service
  - MongoDB

### OCR Service

- **Purpose**: Text extraction from images
- **Key Features**:
  - Text recognition
  - Field extraction
  - Language support
  - Confidence scoring
- **Dependencies**:
  - OCR Provider API
  - Image Processing

## Data Models

### Receipt Schema

```typescript
interface Receipt {
  id: string;
  userId: string;
  originalImage: string;
  thumbnailImage?: string;
  metadata: {
    merchant?: string;
    date?: Date;
    total?: number;
    items?: Array<{
      description: string;
      quantity: number;
      price: number;
    }>;
    tax?: number;
    tip?: number;
  };
  ocrData: {
    text: string;
    confidence: number;
    fields: Record<string, any>;
  };
  status: 'pending' | 'processed' | 'matched' | 'error';
  matchedExpenseId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Report Template Schema

```typescript
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'expense' | 'receipt' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  filters: {
    dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    tags?: string[];
    status?: string[];
  };
  scheduling?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    nextRun: Date;
    recipients: string[];
    active: boolean;
  };
  customization?: {
    logo?: boolean;
    headers?: string[];
    groupBy?: string[];
    sortBy?: string[];
    summary?: boolean;
  };
}
```

## API Structure

### REST Endpoints

- **Base URL**: `/api/v1`
- **Authentication**: JWT
- **Rate Limiting**: Yes
- **Documentation**: OpenAPI/Swagger

### WebSocket Events

- **Connection**: `/ws`
- **Events**:
  - Receipt processing updates
  - Report generation progress
  - Real-time notifications

## Security Implementation

### Authentication Flow

- JWT-based authentication
- Refresh token rotation
- Session management
- 2FA support

### Authorization Rules

- Role-based access control
- Resource-level permissions
- API scope control
- Audit logging

### Data Protection Measures

- At-rest encryption
- In-transit encryption
- Data sanitization
- Input validation

## Development Environment

### Required Software

- Node.js 18+
- MongoDB 6+
- Docker
- Git

### Setup Steps

1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Start development servers

### Development Scripts

- `npm run dev` - Start development
- `npm run test` - Run tests
- `npm run build` - Production build
- `npm run lint` - Code linting

## Deployment Architecture

### Cloud Infrastructure

- **Cloud Provider**: AWS
- **Container Orchestration**: ECS
- **CDN**: CloudFront
- **Storage**: R2
- **Database**: MongoDB Atlas

### CI/CD Process

- GitHub Actions
- Automated testing
- Security scanning
- Staged deployments

### System Monitoring

- Application metrics
- Error tracking
- Performance monitoring
- User analytics

## Performance Optimization

### Frontend Optimizations

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

### Backend Optimizations

- Query optimization
- Connection pooling
- Response caching
- Rate limiting

### Database Optimizations

- Indexing strategy
- Query optimization
- Data modeling
- Caching layer

## Error Handling

### Frontend Error Management

- Global error boundary
- API error handling
- Form validation
- User feedback

### Backend Error Processing

- Exception filters
- Error logging
- Request validation
- Response formatting

### System Error Recovery

- Service recovery
- Failover handling
- Data consistency
- Backup strategy
