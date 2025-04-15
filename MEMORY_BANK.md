# Memory Bank

## Core Services

### Receipt Bank Service

- Handles receipt processing and storage
- Manages OCR integration
- Implements matching algorithms
- Provides receipt search and retrieval

### Report Service

- Generates financial reports
- Supports multiple formats (PDF, CSV, Excel)
- Handles report scheduling
- Manages report templates

### Email Service

- Sends notifications
- Delivers scheduled reports
- Handles password resets
- Manages email templates

### Storage Service

- Manages file uploads
- Handles file retrieval
- Implements caching
- Provides URL signing

## Data Models

### Receipt Schema

```typescript
interface Receipt {
  id: string;
  userId: string;
  fileKey: string;
  thumbnailKey: string;
  metadata: {
    merchant: string;
    date: Date;
    total: number;
    items: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
    confidence: number;
  };
  status: 'pending' | 'processed' | 'matched' | 'archived';
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Report Schema

```typescript
interface Report {
  id: string;
  userId: string;
  name: string;
  type: 'expense' | 'receipt' | 'summary';
  format: 'pdf' | 'csv' | 'excel';
  filters: {
    dateRange: {
      start: Date;
      end: Date;
    };
    categories?: string[];
    tags?: string[];
    status?: string[];
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: Date;
    recipients: string[];
    active: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Template Schema

```typescript
interface Template {
  id: string;
  userId: string;
  name: string;
  type: 'expense' | 'receipt' | 'summary';
  format: 'pdf' | 'csv' | 'excel';
  customization: {
    title: string;
    logoPath?: string;
    groupBy?: string[];
    sortBy?: string;
    includeHeaders: boolean;
    includeSummary: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Components

### Pages

1. Dashboard
2. Receipt Library
3. Reports
4. Settings
5. Profile

### Features

1. Receipt Upload

   - Drag and drop
   - Multi-file support
   - Progress tracking
   - Preview generation

2. Receipt Management

   - Search and filter
   - Batch operations
   - Category assignment
   - Tag management

3. Report Generation

   - Template selection
   - Custom filters
   - Schedule setup
   - Format options

4. User Settings
   - Profile management
   - Notification preferences
   - Integration setup
   - API key management

## API Endpoints

### Receipt Endpoints

```typescript
POST /api/receipts/upload
GET /api/receipts
GET /api/receipts/:id
PUT /api/receipts/:id
DELETE /api/receipts/:id
POST /api/receipts/:id/match
```

### Report Endpoints

```typescript
POST /api/reports
GET /api/reports
GET /api/reports/:id
DELETE /api/reports/:id
POST /api/reports/:id/generate
POST /api/reports/:id/schedule
```

### Template Endpoints

```typescript
POST /api/templates
GET /api/templates
GET /api/templates/:id
PUT /api/templates/:id
DELETE /api/templates/:id
```

## Background Jobs

### Receipt Processing

1. Image optimization
2. OCR processing
3. Data extraction
4. Match finding

### Report Generation

1. Data collection
2. Format processing
3. File generation
4. Notification sending

### System Maintenance

1. Temporary file cleanup
2. Session management
3. Cache invalidation
4. Log rotation

## Environment Variables

### Backend Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=

# Storage
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Auth
JWT_SECRET=
JWT_EXPIRATION=

# Services
OCR_API_KEY=
OCR_API_ENDPOINT=
```

### Frontend Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STORAGE_URL=
NEXT_PUBLIC_GA_ID=
```

## Development Workflows

### Receipt Processing Flow

1. User uploads receipt
2. Image is optimized and stored
3. OCR service processes image
4. Data is extracted and stored
5. Matching algorithm runs
6. User is notified of matches

### Report Generation Flow

1. User creates/schedules report
2. System queues generation job
3. Data is gathered and processed
4. Report is generated in requested format
5. File is stored and link generated
6. Notification is sent to recipients

### Expense Import Flow

1. User uploads CSV file
2. Data is validated and parsed
3. Matching algorithm runs
4. User reviews matches
5. Data is imported
6. Receipts are linked

## Testing Strategy

### Unit Tests

- Service methods
- Utility functions
- Model methods
- Component logic

### Integration Tests

- API endpoints
- Service interactions
- Database operations
- File operations

### E2E Tests

- Critical user flows
- UI interactions
- Data persistence
- Error handling

## Monitoring Points

### Performance Metrics

- API response times
- Database query times
- Storage operations
- Background job duration

### Error Tracking

- API errors
- Processing failures
- Integration issues
- UI exceptions

### Usage Metrics

- Active users
- Receipt uploads
- Report generations
- API calls

## Security Measures

### Data Protection

- Encryption at rest
- Secure file storage
- Data access controls
- Audit logging

### API Security

- JWT authentication
- Rate limiting
- Input validation
- CORS configuration

### User Security

- Role-based access
- Session management
- Password policies
- 2FA support
