# Fresh Expense - Modern Expense Management System

A comprehensive expense management solution built with React, TypeScript, and NestJS. Streamline your expense tracking with automated receipt processing, smart matching, and powerful reporting capabilities.

## Features

### Expense Management

- Intuitive expense tracking and categorization
- Bulk import/export capabilities
- Smart categorization with machine learning
- Multi-currency support with automatic conversion

### Receipt Bank

- OCR-powered receipt scanning and data extraction
- Automatic matching with transactions
- Digital receipt storage with search capabilities
- Receipt metadata management and tagging

### Reports & Analytics

- Customizable report templates
- Multiple export formats (PDF, CSV, Excel)
- Scheduled report generation
- Interactive dashboards and visualizations

### Integration & Automation

- Bank transaction sync
- Email receipt forwarding
- Automated expense matching
- Scheduled data synchronization

### User Management

- Role-based access control
- Team expense management
- Approval workflows
- Audit logging

## Technical Architecture

### Frontend

- React with TypeScript
- Material-UI components
- Redux for state management
- React Query for data fetching

### Backend

- NestJS with TypeScript
- MongoDB for data storage
- Cloudflare R2 for file storage
- Redis for caching

### Services

- OCR processing
- PDF generation
- Email delivery
- Background job processing

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis 7+
- Cloudflare R2 account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fresh-expense.git
cd fresh-expense
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

1. Start development servers:

```bash
# Start backend
npm run dev:backend

# Start frontend
npm run dev:frontend
```

## Project Structure

```text
fresh-expense/
├── apps/
│   ├── backend/           # NestJS backend application
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── main.ts
│   │   └── test/
│   └── frontend/         # React frontend application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── App.tsx
│       └── test/
├── libs/                 # Shared libraries
├── tools/               # Development tools
└── package.json
```

## Configuration

### Backend Configuration

- Database connection
- Storage credentials
- API keys
- Email settings
- Security options

### Frontend Configuration

- API endpoints
- Storage URLs
- Analytics IDs
- Feature flags

## API Documentation

API documentation is available at `/api/docs` when running the development server. The documentation includes:

- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run E2E tests
npm run test:e2e
```

### Test Coverage

```bash
# Generate coverage reports
npm run test:coverage
```

## Monitoring & Logging

### Performance Monitoring

- API response times
- Database query performance
- Storage operations
- Background job execution

### Error Tracking

- API errors
- Processing failures
- Integration issues
- UI exceptions

### Usage Analytics

- Active users
- Feature usage
- API calls
- Storage utilization

## Deployment

### Production Build

```bash
# Build all applications
npm run build

# Build specific application
npm run build:backend
npm run build:frontend
```

### CI/CD Pipeline

1. Code quality checks
2. Unit tests
3. Integration tests
4. Build artifacts
5. Deploy to staging
6. Run E2E tests
7. Deploy to production

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support, please:

- Check the [documentation](docs/)
- Open an issue
- Contact [support@freshexpense.com](mailto:support@freshexpense.com)

## Acknowledgments

- OCR.space for receipt processing
- Material-UI for components
- NestJS team for the framework
- Open source community
