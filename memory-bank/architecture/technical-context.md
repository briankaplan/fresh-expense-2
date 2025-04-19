# Technical Context

## Architecture Overview

### Frontend Architecture

- **Framework**: React with TypeScript
- **State Management**: React Query + Context API (primary), Redux for specific complex state
- **UI Framework**: Material-UI (MUI)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Features**:
  - Real-time updates via WebSocket
  - Offline support with IndexedDB
  - Responsive design
  - Performance optimization

### Backend Architecture

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Caching**: Redis for performance
- **Storage**: Cloudflare R2
- **Queue System**: Bull
- **Testing**: Jest + Supertest

### Core Services

1. **Merchant Services**

   - Merchant data enrichment
   - Subscription detection
   - Purchase history analysis
   - Transaction categorization
   - AI-powered merchant analysis

2. **String Comparison Service**

   - Text normalization
   - Levenshtein distance calculation
   - Jaccard similarity comparison
   - Merchant name matching
   - Receipt matching optimization

3. **Receipt Bank Service**

   - OCR processing
   - Automatic matching
   - Storage management
   - Metadata extraction

4. **Report Service**

   - Template management
   - Scheduled reports
   - Multiple formats
   - Email delivery

5. **OCR Service**
   - Text recognition
   - Field extraction
   - Language support
   - Confidence scoring

## Database Architecture

### MongoDB Configuration

- **Collections**: transactions, expenses, users, companies, notifications
- **Indexing Strategy**: Compound indexes for common queries
- **Sharding**: Planned for high-volume collections
- **Replication**: 3-node replica set for high availability

### Data Models

1. **Transaction Schema**

   - Core financial data with metadata
   - Sync status tracking
   - Audit fields

2. **Receipt Schema**

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
     };
   }
   ```

3. **User Schema**

   - Authentication and permissions
   - Profile information
   - Preferences

4. **Company Schema**
   - Organization settings
   - Billing information
   - User management

## API Architecture

### REST Endpoints

- **Authentication**: JWT-based auth endpoints
- **Transactions**: CRUD operations with filtering
- **Expenses**: Workflow management endpoints
- **Users**: Profile and permission management
- **Companies**: Organization settings endpoints

### WebSocket Services

- Real-time Updates: Transaction and expense changes
- Notifications: User notifications and alerts
- Status Updates: Processing and sync status
- Chat Support: User support communication

## Infrastructure

### Cloudflare Configuration

- **Workers**: Serverless function deployment
- **Pages**: Frontend hosting
- **R2**: Object storage for documents
- **D1**: SQLite database for metadata
- **KV**: Key-value store for caching

### Development Tools

1. **Package Management**

   - pnpm as primary package manager
   - Workspace structure for monorepo
   - Strict version control
   - Lock file management

2. **Development Environment**

   - Node.js LTS
   - TypeScript with strict mode
   - ESLint + Prettier
   - Husky for git hooks

3. **Testing Tools**
   - Jest for unit/integration tests
   - Cypress for E2E
   - Testing Library for components
   - Mock Service Worker for API mocking

## Security and Compliance

1. **Data Protection**

   - Encryption at rest and in transit
   - Secure API endpoints
   - Token-based authentication
   - Role-based access control

2. **Compliance**
   - GDPR compliance
   - Data retention policies
   - Audit logging
   - Security monitoring

## Monitoring and Maintenance

1. **System Health**

   - Health check endpoints
   - Performance monitoring
   - Error tracking
   - Resource utilization

2. **Logging Strategy**
   - Structured logging in JSON
   - Log levels (Debug, Info, Warn, Error)
   - Centralized log management
   - Policy-based retention

## Development Process

1. **Code Standards**

   - TypeScript best practices
   - Clean architecture principles
   - Testing requirements
   - Documentation standards

2. **CI/CD Pipeline**
   - Multi-stage Docker builds
   - Automated testing
   - Staging and production deployments
   - Performance and error monitoring

## Implementation Details

1. Transaction System

   - Schema: MongoDB collections with proper indexing
   - Sync: Bidirectional sync with conflict resolution
   - Validation: Comprehensive field validation
   - Performance: Optimized queries and caching

2. Expense System

   - Workflow: State machine for approval process
   - Validation: Business rule enforcement
   - Integration: Seamless transaction linking
   - Security: Role-based access control

3. Integration Points
   - Teller API: Transaction data ingestion
   - AI Services: Categorization and analysis
   - Storage: Receipt and document management
   - Notifications: Real-time updates

## Technical Challenges

1. Data Consistency

   - Transaction-Expense sync conflicts
   - Real-time update reliability
   - Data validation across systems
   - Error recovery mechanisms

2. Performance Optimization

   - Query optimization for large datasets
   - Caching strategy implementation
   - Real-time update performance
   - Batch processing efficiency

3. Scalability
   - Database sharding strategy
   - Microservices architecture
   - Load balancing implementation
   - Resource utilization optimization

## Authentication System

1. JWT Token Management

   - Type-safe token generation and verification
   - Purpose-specific tokens (email verification, password reset)
   - Configurable expiration times
   - Secure secret handling

2. Email System

   - Templated email content generation
   - Secure link generation
   - Gmail SMTP integration
   - HTML email support

3. Integration Points

   - JWT Auth Guard for route protection
   - Email service for user communication
   - Configuration service for secrets
   - Frontend URL management

4. Security Features

   - Token expiration (24h for verification, 1h for reset)
   - Required secret validation
   - Type-safe payload handling
   - Error handling for missing tokens/secrets

## Shared Utilities

1. Date and Currency

   - Timezone-aware date formatting
   - ISO date validation
   - Currency formatting with locale support
   - Amount calculations and grouping

2. Authentication

   - JWT token generation and verification
   - Email template generation
   - Link generation for verification flows
   - Auth result handling

3. Testing

   - Unit tests for all utilities
   - Integration tests for auth flows
   - Test coverage for edge cases
   - Timezone-aware date testing

4. Type Safety

   - TypeScript interfaces for all data structures
   - Generic type support for token verification
   - Strict null checks
   - Comprehensive error types

## Current Technical Issues

1. R2 Service Issues

   - HfInference type definition missing 'inference' method
   - Need to update Hugging Face API integration for image and text classification
   - Proper error handling for AI service calls
   - Rate limiting implementation for API calls

2. Receipt Bank Service Issues

   - Missing exports from @packages/utils:
     - MatchScoreDetails
     - findBestReceiptMatch
     - ReceiptMatchingOptions
   - Type mismatches in receipt matching logic
   - Argument validation issues in function calls
   - Transaction property access and type safety

3. Receipt Converter Service Issues

   - Missing module @expense/utils
   - Integration with receipt processing pipeline
   - Type definitions for conversion results

4. Package Configuration

   - Invalid 'exclude' property in package.json
   - Module resolution configuration
   - Workspace dependencies management

5. Transaction Processing
   - Type safety in transaction mapping
   - Merchant category handling
   - Location property type definitions
   - Transaction frequency calculation

## Action Items

1. API Integration

   - Update HfInference type definitions or migrate to correct API version
   - Implement proper error handling for AI service calls
   - Add rate limiting for external API calls
   - Update image and text classification implementation

2. Type System

   - Export missing utility types and functions from @packages/utils
   - Fix type mismatches in receipt matching implementation
   - Update Transaction type definitions
   - Implement proper type guards for optional properties

3. Module Structure

   - Resolve module resolution for @expense/utils
   - Clean up package.json configuration
   - Update workspace dependencies
   - Implement proper module exports

4. Receipt Processing

   - Implement robust error handling
   - Add validation for receipt data
   - Improve matching algorithm accuracy
   - Add support for multiple receipt formats

5. Testing and Documentation
   - Add tests for new AI integration
   - Update API documentation
   - Add error handling documentation
   - Document rate limiting behavior
