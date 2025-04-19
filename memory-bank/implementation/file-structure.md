# Project File Structure and Dependencies

## Overview

This document provides a comprehensive map of all files in the project, their dependencies, and relationships. This helps identify duplicates, manage imports, and maintain code organization.

## Backend Structure (`apps/backend/`)

### Core Files

- `main.ts` - Application entry point with NestJS setup, security middleware, and API documentation
- `app.module.ts` - Main module configuration with imports and providers
- `app.controller.ts` - Root controller with health check endpoint
- `app.service.ts` - Root service with application metadata

### Key Directories

1. **Controllers** (`/src/controllers/`)

   - **Authentication**
     - `auth.controller.ts`: Login, register, password management
     - `google.controller.ts`: Google OAuth integration
   - **Core Features**
     - `dashboard.controller.ts`: Dashboard data and statistics
     - `receipt.controller.ts`: Receipt management
     - `ocr.controller.ts`: OCR processing
     - `ai.controller.ts`: AI/ML features

2. **Services** (`/src/services/`)

   - **Authentication**
     - `auth.service.ts`: Authentication logic
     - `token-manager.service.ts`: JWT handling
   - **Core Services**
     - `receipt.service.ts`: Receipt processing
     - `ocr.service.ts`: OCR functionality
     - `teller.service.ts`: Banking integration
     - `r2.service.ts`: File storage
   - **AI Services**
     - `classification.service.ts`: Receipt classification
     - `extraction.service.ts`: Data extraction
     - `similarity.service.ts`: Text similarity
   - **Receipt Processing**
     - `receipt-bank.service.ts`: Core receipt processing and transaction matching
       - Receipt upload and storage
       - OCR processing integration
       - Transaction matching algorithms
       - Duplicate detection
     - `receipt-finder.service.ts`: Advanced receipt search and matching
       - Fuzzy text search
       - Date range filtering
       - Amount range filtering
       - Category and tag filtering
       - Similar receipt detection
     - `receipt-converter.service.ts`: File format handling
       - PDF to image conversion
       - Image optimization for OCR
       - Thumbnail generation
   - **Core Infrastructure**
     - `error-handler.service.ts`: Centralized error handling
       - Error type classification
       - Error normalization
       - Logging integration
       - Notification dispatch
     - `notification.service.ts`: Notification system
       - Real-time notifications
       - Email notifications
       - Error notifications
       - Notification persistence
     - `service-manager.service.ts`: Service lifecycle
       - Service state tracking
       - Retry mechanisms
       - Loading states
       - Operation notifications
     - `base.service.ts`: Service foundation
       - Common service functionality
       - State management
       - Event emission
       - Error handling
   - **Notification System**

     - **Core Components**
       - `notification.module.ts`: Module configuration
       - `notification.controller.ts`: API endpoints
       - `notification.service.ts`: Business logic
       - `notification.repository.ts`: Data access
     - **Types and DTOs**
       - `notification.schema.ts`: Data structure
         - User association
         - Message content
         - Priority levels
         - Action metadata
       - `create-notification.dto.ts`: Creation payload
         - Validation rules
         - Swagger documentation
         - Type definitions
     - **Exception Handling**
       - `notification-exception.filter.ts`: Error processing
         - HTTP exception handling
         - Error response formatting
         - Status code mapping

3. **Modules** (`/src/modules/`)

   - `auth/`: Authentication module
   - `users/`: User management
   - `expenses/`: Expense tracking
   - `merchants/`: Merchant management
   - `reports/`: Reporting functionality
   - `subscriptions/`: Subscription handling
   - `notification/`: Notification system

4. **Middleware** (`/src/middleware/`)

   - `validateRequest.ts`: Request validation
   - `auth.guard.ts`: Authentication guard
   - `jwt.strategy.ts`: JWT strategy
   - `google.strategy.ts`: Google OAuth strategy

5. **Models** (`/src/models/`)

   - `user.schema.ts`: User model
   - `receipt.schema.ts`: Receipt model
   - `transaction.schema.ts`: Transaction model
   - `expense.schema.ts`: Expense model
   - `merchant.schema.ts`: Merchant model
   - **Receipt Models**
     - `receipt.schema.ts`: Receipt data structure
       - User and merchant references
       - Transaction details
       - OCR data storage
       - Processing status tracking
       - Metadata management
     - `receipt-item.schema.ts`: Line item structure
       - Product description
       - Quantity and pricing
       - Category assignment

6. **Config** (`/src/config/`)

   - `app.config.ts`: Application configuration
   - `database.config.ts`: Database settings
   - `auth.config.ts`: Authentication settings
   - `email.config.ts`: Email configuration
   - `storage.config.ts`: Storage settings
   - `teller.config.ts`: Banking API config
   - `logging.config.ts`: Logging configuration

7. **Database** (`/src/database/`)

   - `mongodb.module.ts`: MongoDB configuration
   - `migrations/`: Database migrations
   - `seeds/`: Seed data
   - `repositories/`: Data access layer
   - `receipt.repository.ts`: Receipt data management
     - CRUD operations
     - User-specific queries
     - Date range filtering
     - Processing status updates
     - OCR data management

8. **Types** (`/src/types/`)

   - `dto/`: Data transfer objects
   - `interfaces/`: TypeScript interfaces
   - `enums/`: Enumerated types
   - **Receipt Types**
     - `receipt.types.ts`: Receipt interfaces
       - Search options
       - Match results
       - Processing status
   - **OCR-related Types**
     - `ocr.types.ts`: OCR-related types
       - OCR results
       - Confidence scores
       - Structured data

9. **Utils** (`/src/utils/`)
   - `validators/`: Input validation
   - `transformers/`: Data transformation
   - `helpers/`: Helper functions
   - `constants/`: Shared constants

#### Dependencies

- Framework: NestJS
- Database: MongoDB with Mongoose
- Authentication: Passport.js, JWT
- File Storage: Cloudflare R2
- OCR: Tesseract.js
- AI/ML: HuggingFace
- Email: Nodemailer
- Testing: Jest
- Documentation: Swagger/OpenAPI

#### Security Features

- Helmet for HTTP headers
- Rate limiting
- CORS configuration
- Request validation
- JWT authentication
- Role-based access control

#### Development Tools

- ESLint for code quality
- Prettier for formatting
- TypeScript for type safety
- Jest for testing
- Swagger for API docs
- PM2 for process management

## Frontend Structure (`apps/frontend/`)

### Core Files

- `main.tsx` - Application entry point with React Query and Ant Design setup
- `App.tsx` - Root component with layout structure
- `index.tsx` - DOM rendering and provider setup
- `vite.config.ts` - Build configuration
- `theme.ts` - Theme configuration

### Key Directories

1. **Components** (`/src/components/`)

   - **Layout Components**
     - `MainLayout.tsx`: Main application layout with navigation
     - `DashboardLayout.tsx`: Dashboard-specific layout
     - `AuthLayout.tsx`: Authentication pages layout
   - **Common Components**
     - `HealthCheck.tsx`: System health monitoring
     - `Loading.tsx`: Loading states
     - `ErrorBoundary.tsx`: Error handling
   - **Feature Components**
     - `Dashboard/`: Dashboard widgets
     - `Expenses/`: Expense management
     - `Receipts/`: Receipt handling
       - `ReceiptUpload.tsx`: Receipt upload interface
         - Drag and drop support
         - Multiple file handling
         - Progress tracking
         - Error handling
       - `ReceiptViewer.tsx`: Receipt display component
         - Image/PDF preview
         - OCR text overlay
         - Extracted data display
         - Edit capabilities
       - `ReceiptList.tsx`: Receipt management
         - Filtering and sorting
         - Batch operations
         - Status tracking
       - `ReceiptMatch.tsx`: Transaction matching
         - Suggested matches
         - Manual matching
         - Confidence scores
       - `ReceiptAnalytics.tsx`: Spending analysis
         - Category breakdown
         - Merchant analysis
         - Time-based trends
     - `Reports/`: Reporting components

2. **Pages** (`/src/pages/`)

   - Authentication
     - `Login.tsx`
     - `Register.tsx`
     - `ForgotPassword.tsx`
     - `ResetPassword.tsx`
     - `VerifyEmail.tsx`
   - Main Features
     - `Dashboard.tsx`
     - `ExpensesList.tsx`
     - `AddExpense.tsx`
     - `EditExpense.tsx`
     - `Accounts.tsx`
     - `Transactions.tsx`
     - `Subscriptions.tsx`
     - `Settings.tsx`

3. **Services** (`/src/services/`)

   - `api.ts`: API client setup
   - `receipt.service.ts`: Receipt management
     - Upload handling
     - OCR processing
     - Transaction matching
     - Data extraction
     - Status tracking
   - `storage.service.ts`: File management
     - File upload/download
     - Thumbnail generation
     - Cache management
   - `analytics.service.ts`: Data analysis
     - Spending patterns
     - Category analysis
     - Merchant insights

4. **Context** (`/src/context/`)

   - `ReceiptContext.tsx`: Receipt state management
     - Upload queue
     - Processing status
     - Filter settings
     - Selected receipts
   - `MatchingContext.tsx`: Transaction matching state
     - Suggested matches
     - Match history
     - Confidence thresholds

5. **Hooks** (`/src/hooks/`)

   - **Receipt Hooks**
     - `useReceiptUpload`: Upload management
     - `useReceiptProcessing`: OCR status tracking
     - `useReceiptMatching`: Transaction matching
     - `useReceiptAnalytics`: Analysis and insights
   - **Storage Hooks**
     - `useFileUpload`: File upload handling
     - `useImageProcessing`: Image optimization
     - `useThumbnails`: Thumbnail management

6. **Utils** (`/src/utils/`)

   - Helper functions
   - Data transformers
   - Type guards

7. **Types** (`/src/types/`)

   - TypeScript interfaces
   - Type definitions
   - Enums

8. **Styles** (`/src/styles/`)
   - Global styles
   - Theme definitions
   - Component styles

### Configuration Files

- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `vite.config.ts` - Vite build configuration
- `.env.*` - Environment configurations

### Build and Deploy

- `Dockerfile` - Container configuration
- `nginx.conf` - Nginx server configuration
- `project.json` - Project metadata

## Workers Structure (`apps/workers/`)

### Receipt Processing Workers

1. **OCR Worker** (`apps/workers/ocr-worker/`)

   - **Core Files**
     - `src/index.ts`: Worker entry point
     - `src/ocr.ts`: OCR processing logic
     - `src/image-processing.ts`: Image optimization
     - `wrangler.toml`: Worker configuration
   - **Features**
     - Asynchronous OCR processing
     - Image preprocessing
     - Multiple OCR engine support
     - Error handling and retries
     - Progress tracking
     - Result caching

2. **Receipt Analysis Worker** (`apps/workers/receipt-analysis/`)

   - **Core Files**
     - `src/index.ts`: Worker entry point
     - `src/analysis.ts`: Analysis logic
     - `src/matching.ts`: Transaction matching
     - `wrangler.toml`: Worker configuration
   - **Features**
     - Receipt categorization
     - Merchant recognition
     - Transaction matching
     - Duplicate detection
     - Subscription detection
     - Analytics processing

3. **File Processing Worker** (`apps/workers/file-upload/`)

   - **Core Files**
     - `src/index.ts`: File upload handler
     - `src/processors/`: File type processors
     - `src/validators/`: File validation
     - `wrangler.toml`: Worker configuration
   - **Features**
     - File type detection
     - Format conversion
     - Image optimization
     - Thumbnail generation
     - Virus scanning
     - Metadata extraction

### Shared Resources

- **KV Namespaces**

  - `OCR_CACHE`: OCR result caching
  - `RECEIPT_METADATA`: Receipt metadata storage
  - `PROCESSING_QUEUE`: Job queue management
  - `MATCHING_RESULTS`: Transaction matching results

- **R2 Buckets**
  - `RECEIPTS`: Original receipt storage
  - `THUMBNAILS`: Receipt thumbnails
  - `PROCESSED`: Processed receipt images
  - `ARCHIVES`: Long-term storage

### Worker Communication

- **Event Types**

  - Receipt upload events
  - OCR completion events
  - Analysis completion events
  - Matching result events
  - Error events

- **Queue Management**
  - Priority queuing
  - Rate limiting
  - Error handling
  - Retry strategies
  - Dead letter queues

### Monitoring and Logging

- **Metrics**

  - Processing times
  - Success rates
  - Error rates
  - Queue lengths
  - Resource usage

- **Logging**
  - Error tracking
  - Performance monitoring
  - Security events
  - Usage patterns

### API Gateway (`apps/workers/api-gateway/`)

- **Core Files**

  - `src/index.ts` - Worker entry point with request handler
  - `src/routes.ts` - Router configuration with endpoint definitions
  - `src/types.ts` - TypeScript interfaces and environment types
  - `wrangler.toml` - Worker configuration

- **Key Directories**

  1. **Handlers** (`/src/handlers/`)

     - `health.ts`: Health check endpoint
     - `expenses.ts`: Expense management
     - `files.ts`: File upload/download
     - `webhooks.ts`: Webhook processing

  2. **Middleware** (`/src/middleware/`)
     - `auth.ts`: Authentication middleware
     - `cors.ts`: CORS handling
     - `error.ts`: Error handling

### Teller Webhook (`apps/workers/teller-webhook/`)

- **Core Files**
  - `src/index.ts` - Webhook handler entry point
  - `package.json` - Dependencies and scripts
  - `tsconfig.json` - TypeScript configuration
  - `wrangler.toml` - Worker configuration

### File Upload (`apps/workers/file-upload/`)

- **Core Files**
  - `src/index.ts` - File upload handler
  - `wrangler.toml` - Worker configuration

### Shared Configuration

- **Environment Variables**

  - JWT configuration
  - MongoDB connection
  - R2 storage settings
  - API endpoints
  - External service credentials

- **KV Namespaces**

  - `CACHE`: General caching
  - `USERS`: User data
  - `TRANSACTIONS`: Transaction records

- **R2 Buckets**
  - `FILES`: File storage
  - Development and production buckets

### Deployment Configuration

- **GitHub Actions**

  - Automated deployment to Cloudflare
  - Environment variable management
  - KV namespace creation
  - R2 bucket setup

- **Security Features**

  - JWT authentication
  - API token validation
  - CORS policies
  - Rate limiting

- **Development Tools**
  - TypeScript configuration
  - ESLint and Prettier
  - Wrangler CLI
  - GitHub Actions

### Scripts

- `setup-cloudflare.sh`: Initialize Cloudflare resources
- `setup-secrets.sh`: Configure GitHub secrets

## Common Dependencies

- Shared types between frontend and backend
- Utility functions used across services
- Configuration shared between environments

## Known Duplications

[To be populated as we identify duplicates]

## Import Patterns

[To be documented based on codebase analysis]

### Backend Application (`backend/`)

- **Purpose**: NestJS-based backend server for expense management
- **Key Files and Directories**:
  - `src/`: Source code directory
    - `main.ts`: Application entry point with server configuration
    - `app.module.ts`: Root module with application configuration
    - `app/`: Core application modules
      - `auth/`: Authentication module
        - `guards/`: JWT and role-based guards
        - `strategies/`: Passport strategies (JWT, Google)
      - `users/`: User management module
      - `expenses/`: Expense tracking module
      - `merchants/`: Merchant management
      - `reports/`: Reporting functionality
      - `subscriptions/`: Subscription handling
    - `controllers/`: API endpoints
      - `ai.controller.ts`: AI-related endpoints
      - `dashboard.controller.ts`: Dashboard data
      - `google.controller.ts`: Google integration
      - `ocr.controller.ts`: Receipt OCR processing
      - `receipt.controller.ts`: Receipt management
    - `services/`: Business logic
      - `ai/`: AI services (classification, extraction)
      - `ocr/`: OCR processing
      - `receipt/`: Receipt handling
      - `r2/`: R2 storage service
      - `teller/`: Banking integration
      - `notification/`: Notification system
    - `middleware/`: Request processing
      - `validateRequest.ts`: Request validation
    - `schemas/`: Database models
    - `types/`: TypeScript type definitions
    - `config/`: Configuration files
- **Key Features**:
  - NestJS framework with TypeScript
  - MongoDB with Mongoose ODM
  - JWT authentication
  - Google OAuth integration
  - File upload and processing
  - OCR capabilities
  - AI-powered analysis
  - Real-time notifications
  - Rate limiting and security
- **API Endpoints**:
  - `/auth`: Authentication routes
  - `/users`: User management
  - `/expenses`: Expense tracking
  - `/merchants`: Merchant data
  - `/reports`: Report generation
  - `/ai`: AI analysis
  - `/ocr`: Receipt processing
  - `/google`: Google integration
- **Dependencies**:
  - NestJS
  - MongoDB/Mongoose
  - Passport.js
  - JWT
  - Multer
  - Sharp
  - Tesseract.js
  - Node-mailer

### Frontend Application (`frontend/`)

- **Purpose**: React-based web application for expense management
- **Key Files and Directories**:
  - `src/`: Source code directory
    - `app/`: Core application files
      - `app.tsx`: Main application component with layout structure
      - `app.spec.tsx`: Application tests
    - `components/`: Reusable UI components
      - `Layout/`: Layout components
        - `AppLayout.tsx`: Main application layout with navigation
      - `dashboard/`: Dashboard-specific components
      - `HealthCheck.tsx`: System health status component
      - `ProtectedRoute.tsx`: Authentication route wrapper
      - `AppProviders.tsx`: Application context providers
    - `routes/`: Routing configuration
      - `index.tsx`: Route definitions and lazy loading
      - `constants.ts`: Route path constants
    - `context/`: React context providers
      - `AuthContext.tsx`: Authentication context
      - `ThemeContext.tsx`: Theme management
    - `hooks/`: Custom React hooks
      - `useAuth.ts`: Authentication hook
    - `pages/`: Page components
      - `Dashboard.tsx`: Main dashboard view
      - `Login.tsx`: Authentication views
      - `Register.tsx`: User registration
      - `Expenses/`: Expense management views
      - `Accounts/`: Account management views
      - `Settings/`: Application settings
    - `styles/`: Styling files
      - `index.scss`: Global styles
    - `types/`: TypeScript type definitions
    - `main.tsx`: Application entry point
- **Key Features**:
  - Material-UI and Ant Design components
  - React Router for navigation
  - Protected routes with authentication
  - Responsive layout with sidebar navigation
  - Real-time health monitoring
  - Theme customization
  - Error boundary implementation
  - Lazy loading for optimized performance
- **State Management**:
  - React Query for server state
  - Context API for global state
  - Zustand for UI state
- **Dependencies**:
  - React 18+
  - Material-UI
  - Ant Design
  - React Router
  - React Query
  - Date-fns
  - TypeScript

#### Dependencies

- UI Framework: Material-UI, Ant Design
- State Management: React Query, Zustand
- Routing: React Router
- Forms: Formik, Yup
- HTTP Client: Axios
- Real-time: Socket.io
- Testing: Vitest, React Testing Library
- Build Tools: Vite, TypeScript

#### Development Tools

- ESLint for code quality
- Prettier for code formatting
- TypeScript for type safety
- Webpack for bundling
- Development server with HMR

## Packages Structure (`packages/`)

### Utils Package (`packages/utils/`)

- **Core Files**

  - `index.ts` - Main entry point and exports
  - `package.json` - Package configuration and dependencies
  - `vite.config.ts` - Build configuration
  - `tsconfig.json` - TypeScript configuration
  - `README.md` - Package documentation

- **Key Directories**

  1. **String Utilities** (`/src/string/`)

     - `string-comparison.ts`: Text comparison functions
     - `text-normalization.ts`: Text normalization utilities

  2. **Receipt Utilities** (`/src/receipt/`)

     - `receipt-matching.ts`: Receipt matching algorithms
     - `merchant-matching.ts`: Merchant name matching
     - `amount-matching.ts`: Amount comparison
     - `date-matching.ts`: Date comparison

  3. **Image Processing** (`/src/image/`)

     - `image-processing.ts`: Image manipulation
     - `pdf-conversion.ts`: PDF to image conversion
     - `thumbnail-generation.ts`: Thumbnail creation
     - `metadata-extraction.ts`: Image metadata handling

  4. **Cloudflare R2** (`/src/cloudflare/`)

     - `r2-helpers.ts`: R2 storage utilities
     - `url-generation.ts`: Signed URL generation
     - `storage-keys.ts`: Key generation utilities

  5. **Merchant Analysis** (`/src/merchant/`)

     - `category-utils.ts`: Category management
     - `subscription-detection.ts`: Subscription analysis
     - `transaction-analysis.ts`: Transaction patterns

  6. **Authentication** (`/src/auth/`)

     - `jwt-helpers.ts`: JWT utilities
     - `auth-utils.ts`: Authentication helpers

  7. **Email** (`/src/email/`)

     - `email-templates.ts`: Email template system
     - `template-helpers.ts`: Template utilities

  8. **Database** (`/src/database/`)
     - `collection-helpers.ts`: MongoDB utilities
     - `query-builders.ts`: Query construction

### Types Package (`packages/types/`)

- **Core Files**

  - `index.ts` - Type definitions exports
  - `package.json` - Package configuration
  - `tsconfig.json` - TypeScript configuration

- **Key Directories**

  1. **Models** (`/src/models/`)

     - `user.types.ts`: User-related types
     - `receipt.types.ts`: Receipt types
     - `transaction.types.ts`: Transaction types
     - `expense.types.ts`: Expense types

  2. **API** (`/src/api/`)

     - `requests.types.ts`: API request types
     - `responses.types.ts`: API response types
     - `endpoints.types.ts`: API endpoint types

  3. **Services** (`/src/services/`)

     - `auth.types.ts`: Authentication types
     - `ocr.types.ts`: OCR service types
     - `storage.types.ts`: Storage service types

  4. **Utils** (`/src/utils/`)
     - `common.types.ts`: Shared utility types
     - `config.types.ts`: Configuration types

### Dependencies

- **Build Tools**

  - Vite for bundling
  - TypeScript for type checking
  - ESLint for linting
  - Vitest for testing

- **Runtime Dependencies**

  - sharp for image processing
  - pdf-img-convert for PDF handling
  - jsonwebtoken for JWT operations
  - @nestjs/common for shared decorators

- **Development Tools**
  - vite-plugin-dts for type generation
  - vite-plugin-static-copy for asset copying
  - TypeScript ESLint plugins

### Configuration

- **Build Settings**

  - ES modules and CommonJS output
  - Source maps enabled
  - Type declarations
  - Minification with esbuild

- **Testing Setup**
  - Vitest configuration
  - Node.js test environment
  - Coverage reporting

## Tools Structure (`tools/`)

### Build Tools (`tools/build/`)

- **Core Files**

  - `vite.config.base.ts` - Base Vite configuration
  - `webpack.config.base.js` - Base Webpack configuration
  - `tsconfig.base.json` - Base TypeScript configuration

- **Key Directories**

  1. **Scripts** (`/scripts/`)

     - `build.ts`: Build orchestration
     - `clean.ts`: Cleanup utilities
     - `watch.ts`: Development watchers
     - `analyze.ts`: Bundle analysis

  2. **Config** (`/config/`)
     - `paths.ts`: Path configurations
     - `env.ts`: Environment setup
     - `constants.ts`: Build constants

### Development Tools (`tools/dev/`)

- **Core Files**

  - `setup-dev.sh` - Development environment setup
  - `dev-server.ts` - Development server configuration
  - `hot-reload.ts` - HMR configuration

- **Key Directories**

  1. **Scripts** (`/scripts/`)

     - `seed-data.ts`: Database seeding
     - `mock-api.ts`: API mocking
     - `test-data.ts`: Test data generation

  2. **Templates** (`/templates/`)
     - `component.tsx.hbs`: Component templates
     - `service.ts.hbs`: Service templates
     - `test.ts.hbs`: Test templates

### Linting and Formatting (`tools/quality/`)

- **Core Files**

  - `.eslintrc.js` - ESLint configuration
  - `.prettierrc` - Prettier configuration
  - `tsconfig.lint.json` - TypeScript lint config

- **Key Directories**

  1. **Rules** (`/rules/`)

     - `typescript.js`: TypeScript rules
     - `react.js`: React rules
     - `import.js`: Import rules
     - `prettier.js`: Prettier rules

  2. **Scripts** (`/scripts/`)
     - `lint.ts`: Lint execution
     - `format.ts`: Code formatting
     - `check-types.ts`: Type checking

### Testing Tools (`tools/testing/`)

- **Core Files**

  - `jest.config.base.js` - Base Jest configuration
  - `vitest.config.ts` - Vitest configuration
  - `setup-tests.ts` - Test environment setup

- **Key Directories**

  1. **Helpers** (`/helpers/`)

     - `test-utils.ts`: Testing utilities
     - `mocks.ts`: Common mocks
     - `fixtures.ts`: Test fixtures

  2. **Scripts** (`/scripts/`)
     - `run-tests.ts`: Test execution
     - `coverage.ts`: Coverage reporting
     - `e2e.ts`: E2E test setup

### Deployment Tools (`tools/deploy/`)

- **Core Files**

  - `deploy.sh` - Deployment script
  - `rollback.sh` - Rollback script
  - `health-check.ts` - Health monitoring

- **Key Directories**

  1. **Scripts** (`/scripts/`)

     - `backup.ts`: Database backup
     - `migrate.ts`: Database migration
     - `verify.ts`: Deployment verification

  2. **Config** (`/config/`)
     - `nginx.conf`: Nginx configuration
     - `pm2.config.js`: PM2 configuration
     - `docker-compose.yml`: Docker configuration

### Documentation Tools (`tools/docs/`)

- **Core Files**

  - `generate-docs.ts` - Documentation generator
  - `api-docs.ts` - API documentation
  - `changelog.ts` - Changelog generator

- **Key Directories**

  1. **Templates** (`/templates/`)

     - `api.md.hbs`: API documentation templates
     - `component.md.hbs`: Component documentation
     - `readme.md.hbs`: README templates

  2. **Scripts** (`/scripts/`)
     - `build-docs.ts`: Documentation build
     - `validate-docs.ts`: Documentation validation
     - `publish-docs.ts`: Documentation publishing

### Dependencies

- **Build Tools**

  - Vite
  - Webpack
  - TypeScript
  - ESBuild

- **Development Tools**

  - ESLint
  - Prettier
  - Husky
  - Lint-staged

- **Testing Tools**

  - Jest
  - Vitest
  - Testing Library
  - Cypress

- **Documentation Tools**
  - TypeDoc
  - Swagger
  - Storybook
  - Docusaurus

### Configuration

- **Build Settings**

  - Module bundling
  - Asset optimization
  - Source maps
  - Tree shaking

- **Development Setup**
  - Hot reloading
  - Development server
  - Proxy configuration
  - Environment management

## Development Tools and Utilities

### Code Quality Tools

1. **Linting and Formatting**

   - **ESLint Configuration**
     - `eslint.config.js`: Base configuration
     - `.eslintignore`: Ignore patterns
     - Custom rules and plugins
     - TypeScript integration
   - **Prettier Setup**
     - `.prettierrc`: Formatting rules
     - `.prettierignore`: Ignore patterns
     - Editor integration
     - Pre-commit hooks

2. **Type Checking**
   - **TypeScript Configuration**
     - `tsconfig.base.json`: Base configuration
     - `tsconfig.build.json`: Build settings
     - Path aliases
     - Type definitions

### Development Utilities

1. **Scripts** (`scripts/`)

   - **Development**
     - `dev.sh`: Development server
     - `build.sh`: Production build
     - `clean.sh`: Cleanup utilities
     - `seed.sh`: Database seeding
   - **Deployment**
     - `deploy.sh`: Deployment script
     - `rollback.sh`: Rollback script
     - `backup.sh`: Backup utilities
     - `migrate.sh`: Database migration

2. **Documentation** (`docs/`)

   - **API Documentation**
     - OpenAPI specifications
     - API usage guides
     - Authentication flows
     - Error handling
   - **Development Guides**
     - Setup instructions
     - Contributing guidelines
     - Code style guide
     - Best practices

### Development Environment

1. **Docker Setup**

   - **Development Containers**
     - MongoDB container
     - Redis container
     - MinIO (S3) container
     - Test containers
   - **Configuration**
     - Environment variables
     - Volume mounts
     - Network setup
     - Resource limits

2. **Local Tools**

   - **Database Tools**
     - MongoDB Compass
     - Redis Commander
     - Database migration tools
   - **Monitoring Tools**
     - Grafana dashboards
     - Prometheus metrics
     - Logging viewers
     - Performance monitors

### Code Generation

1. **Templates**

   - **Component Templates**
     - React component templates
     - Service templates
     - Controller templates
     - Test templates
   - **Documentation Templates**
     - API documentation
     - README templates
     - Change log templates
     - License templates

2. **Generators**

   - **Code Scaffolding**
     - Component generators
     - Service generators
     - Module generators
     - Test generators
   - **Documentation Generation**
     - API documentation
     - Type documentation
     - Changelog generation
     - Dependency graphs

### Development Standards

1. **Code Organization**

   - File naming conventions
   - Directory structure
   - Import organization
   - Code grouping

2. **Git Workflow**

   - Branch naming
   - Commit messages
   - Pull request templates
   - Code review guidelines

3. **Documentation Standards**
   - Code comments
   - API documentation
   - README files
   - Change logs

### Performance Tools

1. **Profiling**

   - CPU profiling
   - Memory profiling
   - Network monitoring
   - Database query analysis

2. **Optimization**
   - Bundle analysis
   - Code splitting
   - Tree shaking
   - Cache optimization

### Security Tools

1. **Security Scanning**

   - Dependency scanning
   - Code scanning
   - Container scanning
   - Secret detection

2. **Authentication Tools**
   - JWT debugging
   - OAuth testing
   - Permission testing
   - Session management

## Testing Structure

### Unit Tests

1. **Backend Tests** (`apps/backend/src/**/*.spec.ts`)

   - **Service Tests**
     - `receipt-bank.service.spec.ts`: Receipt processing tests
     - `ocr.service.spec.ts`: OCR functionality tests
     - `extraction.service.spec.ts`: Data extraction tests
     - `r2.service.spec.ts`: Storage service tests
   - **Controller Tests**
     - `receipt.controller.spec.ts`: API endpoint tests
     - `ocr.controller.spec.ts`: OCR endpoint tests
   - **Repository Tests**
     - `receipt.repository.spec.ts`: Data access tests
     - `transaction.repository.spec.ts`: Transaction tests

2. **Frontend Tests** (`apps/frontend/src/**/*.spec.tsx`)

   - **Component Tests**
     - `ReceiptUpload.spec.tsx`: Upload functionality tests
     - `ReceiptViewer.spec.tsx`: Display functionality tests
     - `ReceiptList.spec.tsx`: List management tests
   - **Hook Tests**
     - `useReceiptUpload.spec.ts`: Upload hook tests
     - `useReceiptProcessing.spec.ts`: Processing hook tests
     - `useReceiptMatching.spec.ts`: Matching hook tests

3. **Worker Tests** (`apps/workers/**/src/**/*.spec.ts`)

   - **OCR Worker Tests**
     - `ocr-processing.spec.ts`: OCR logic tests
     - `image-processing.spec.ts`: Image handling tests
   - **Analysis Worker Tests**
     - `receipt-analysis.spec.ts`: Analysis logic tests
     - `transaction-matching.spec.ts`: Matching logic tests

### Integration Tests

1. **API Integration** (`apps/backend-e2e/src/api/`)

   - `receipt-upload.e2e-spec.ts`: Upload flow tests
   - `receipt-processing.e2e-spec.ts`: Processing flow tests
   - `transaction-matching.e2e-spec.ts`: Matching flow tests

2. **Worker Integration** (`apps/workers-e2e/src/`)
   - `ocr-pipeline.e2e-spec.ts`: OCR pipeline tests
   - `analysis-pipeline.e2e-spec.ts`: Analysis pipeline tests
   - `storage-pipeline.e2e-spec.ts`: Storage pipeline tests

### Test Utilities

1. **Mocks** (`test/mocks/`)

   - `receipt.mock.ts`: Receipt data mocks
   - `transaction.mock.ts`: Transaction data mocks
   - `ocr-result.mock.ts`: OCR result mocks
   - `r2-storage.mock.ts`: Storage service mocks

2. **Fixtures** (`test/fixtures/`)

   - `sample-receipts/`: Test receipt images
   - `sample-pdfs/`: Test PDF files
   - `expected-results/`: Expected OCR outputs
   - `test-data/`: Test databases

3. **Helpers** (`test/helpers/`)
   - `test-utils.ts`: Common test utilities
   - `setup-database.ts`: Database setup helpers
   - `cleanup-storage.ts`: Storage cleanup utilities
   - `mock-services.ts`: Service mocking utilities

### Test Configuration

1. **Jest Configuration**

   - `jest.config.js`: Base configuration
   - `jest.setup.js`: Test environment setup
   - `jest.teardown.js`: Test cleanup

2. **Vitest Configuration**
   - `vitest.config.ts`: Test runner setup
   - `vitest.setup.ts`: Test environment
   - `vitest.teardown.ts`: Cleanup routines

### CI/CD Testing

1. **GitHub Actions**

   - Unit test workflows
   - Integration test workflows
   - E2E test workflows
   - Performance test workflows

2. **Test Reports**
   - Coverage reports
   - Performance metrics
   - Error logs
   - Test summaries

### Testing Standards

1. **Naming Conventions**

   - Test file naming
   - Test case naming
   - Mock naming
   - Fixture naming

2. **Best Practices**

   - Test isolation
   - Mock usage
   - Assertion patterns
   - Error handling

3. **Documentation**
   - Test coverage requirements
   - Test writing guidelines
   - Mock data management
   - Test maintenance

## Infrastructure and Deployment

### CI/CD Configuration (`.github/workflows/`)

- **Core Workflows**
  - `cloudflare.yml`: Cloudflare Pages and Workers deployment
  - `docker.yml`: Container build and registry push
  - `deploy-production.yml`: Production deployment pipeline
  - `build.yml`: Build and test pipeline
  - `renovate.yml`: Dependency updates automation

### Deployment Configurations

1. **Cloudflare Configuration** (`.cloudflare/`)

   - `edge-config.toml`: Edge configuration
     - Build settings
     - Environment variables
     - Routing rules
     - Security headers
     - KV namespaces
     - R2 buckets
     - Worker routes

2. **Docker Configuration**

   - `Dockerfile`: Multi-stage build configuration
   - `docker-compose.yml`: Local development setup
   - `docker-compose.prod.yml`: Production deployment
   - `docker-compose.monitoring.yml`: Monitoring stack

3. **Environment Configuration**
   - `.env.development`: Development variables
   - `.env.production`: Production variables
   - `.env.test`: Testing variables
   - `.env.local`: Local overrides (git-ignored)

### Deployment Scenarios

1. **Local Development**

   - Prerequisites:
     - Node.js 20.11.1+
     - pnpm 8.15.4+
     - MongoDB 7.0+
     - Docker 24.0+ (optional)
   - Setup commands:
     ```bash
     pnpm install
     pnpm dev
     ```

2. **Docker Development**

   - Prerequisites:
     - Docker 24.0+
     - Docker Compose 2.20+
   - Setup:
     ```bash
     docker-compose -f docker-compose.dev.yml up --build
     ```

3. **Production Deployment**
   - Prerequisites:
     - Cloudflare account
     - MongoDB Atlas
     - Domain and SSL
   - Deployment:
     ```bash
     docker-compose -f docker-compose.prod.yml up -d
     ```

### Monitoring and Observability

1. **Health Checks**

   - API health endpoints
   - Service status monitoring
   - Database connectivity checks

2. **Metrics Collection**

   - Prometheus metrics
   - Grafana dashboards
   - Custom business metrics

3. **Logging**
   - Structured JSON logging
   - Log aggregation
   - Error tracking

### Security Configuration

1. **Authentication**

   - JWT configuration
   - OAuth settings
   - API keys management

2. **Network Security**

   - CORS policies
   - Rate limiting
   - DDoS protection

3. **Data Security**
   - Encryption at rest
   - Secure communication
   - Access control

### Scaling Configuration

1. **Horizontal Scaling**

   - Load balancing
   - Service replication
   - Database sharding

2. **Performance Optimization**
   - Caching strategies
   - Resource limits
   - Query optimization

### Backup and Recovery

1. **Backup Procedures**

   - Database backups
   - File storage backups
   - Configuration backups

2. **Recovery Procedures**
   - Disaster recovery
   - Data restoration
   - Service recovery

### Required Secrets

1. **Cloudflare Configuration**

   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_ZONE_ID`

2. **Database Configuration**

   - `MONGODB_URI`
   - `ENCRYPTION_KEY`
   - `ENCRYPTION_IV`

3. **Storage Configuration**

   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`

4. **External Services**
   - `HUGGINGFACE_API_TOKEN`
   - `SENDGRID_API_KEY`
   - `TELLER_APPLICATION_ID`
   - `GOOGLE_CLIENT_IDs`

---

Note: This is a living document that will be updated as we continue our codebase analysis.

- **Service Infrastructure**

  - **Monitoring and Health**

    - **Health Checks**
      - `mongodb.health.ts`: Database health indicator
        - Connection status
        - Query capability
        - Error reporting
      - `stats.service.ts`: System statistics
        - Service status
        - Memory usage
        - Uptime tracking
        - Database status
      - `stats.controller.ts`: Health endpoints
        - Health check API
        - Dashboard statistics
        - Expense analytics
    - **Logging System**
      - `logging.service.ts`: Centralized logging
        - Multiple log levels
        - JSON/Text formatting
        - Context tracking
        - File rotation
      - **Configuration**
        - Log file management
        - Level configuration
        - Format settings
        - Retention policies
      - **Log Types**
        - Application logs
        - Error logs
        - Debug logs
        - Access logs
    - **Performance Monitoring**
      - `loading.interceptor.ts`: Operation tracking
        - Request timing
        - Loading states
        - Error tracking
        - Event emission
      - **Metrics Collection**
        - Response times
        - Error rates
        - Resource usage
        - API usage

  - **Rate Limiting**

    - `rate-limiter.service.ts`: Request throttling
      - Rate configuration
      - Backoff strategies
      - Retry mechanisms
      - Limit tracking

  - **Event System**
    - **Event Types**
      - Service events
      - Loading events
      - Error events
      - State changes
    - **Event Handlers**
      - Event processing
      - State updates
      - Notification dispatch
      - Metric recording

## Code Analysis and Auditing Tools

### Static Analysis Tools

1. **Code Quality Analysis**

   - **ESLint Configuration**
     - Custom rules for codebase standards
     - TypeScript-specific rules
     - React best practices
     - Security rules
   - **SonarQube Integration**
     - Code quality gates
     - Security vulnerability scanning
     - Duplicate code detection
     - Technical debt tracking

2. **Dependency Analysis**

   - **Dependency Graph Generator**
     - Service dependency mapping
     - Component relationship visualization
     - Circular dependency detection
     - Import path analysis
   - **Package Analysis**
     - Version compatibility checking
     - Security vulnerability scanning
     - License compliance checking
     - Bundle size analysis

### Documentation Tools

1. **API Documentation**

   - **OpenAPI Generator**
     - Endpoint documentation
     - Request/response schemas
     - Authentication flows
     - Example requests
   - **TypeDoc Integration**
     - Interface documentation
     - Type definitions
     - Function signatures
     - Class hierarchies

2. **Implementation Auditing**

   - **Audit Templates**
     - Feature implementation status
     - Known issues tracking
     - Integration points
     - Configuration requirements
   - **Code Coverage Reports**
     - Unit test coverage
     - Integration test coverage
     - E2E test coverage
     - Branch coverage

### Analysis Scripts

1. **Codebase Analysis**

   - **Service Analyzer**
     ```typescript
     interface ServiceAnalysis {
       name: string;
       dependencies: string[];
       publicMethods: MethodInfo[];
       eventHandlers: EventInfo[];
       configurationKeys: string[];
       testCoverage: Coverage;
     }
     ```
   - **Component Analyzer**
     ```typescript
     interface ComponentAnalysis {
       name: string;
       props: PropInfo[];
       hooks: HookInfo[];
       childComponents: string[];
       stateManagement: StateInfo;
       styling: StylingInfo;
     }
     ```

2. **Integration Analysis**

   - **API Analyzer**
     ```typescript
     interface APIAnalysis {
       endpoint: string;
       method: string;
       authentication: AuthInfo;
       requestSchema: SchemaInfo;
       responseSchema: SchemaInfo;
       errorHandling: ErrorInfo[];
     }
     ```
   - **Event Analyzer**
     ```typescript
     interface EventAnalysis {
       eventName: string;
       publishers: string[];
       subscribers: string[];
       payload: SchemaInfo;
       asyncHandling: boolean;
     }
     ```

### Monitoring Tools

1. **Performance Analysis**

   - **API Performance**
     - Response time tracking
     - Error rate monitoring
     - Request volume analysis
     - Endpoint usage statistics
   - **Resource Usage**
     - Memory consumption
     - CPU utilization
     - Network bandwidth
     - Database connections

2. **Error Tracking**

   - **Error Analysis**
     - Error frequency
     - Error categories
     - Stack trace analysis
     - Impact assessment
   - **Alert System**
     - Threshold alerts
     - Error rate alerts
     - Resource usage alerts
     - Custom metric alerts

### Audit Workflows

1. **Implementation Review**

   ```bash
   # Generate implementation audit
   npm run audit:implementation

   # Generate coverage report
   npm run audit:coverage

   # Generate dependency graph
   npm run audit:dependencies

   # Generate API documentation
   npm run audit:api
   ```

2. **Quality Gates**

   ```bash
   # Run all quality checks
   npm run quality:check

   # Run security scan
   npm run security:scan

   # Run performance tests
   npm run perf:test

   # Generate quality report
   npm run quality:report
   ```

### Report Generation

1. **Audit Reports**

   - Implementation status
   - Known issues
   - Technical debt
   - Security vulnerabilities
   - Performance metrics
   - Test coverage
   - Code quality metrics

2. **Documentation Generation**
   - API documentation
   - Component documentation
   - Configuration guide
   - Integration guide
   - Deployment guide
   - Troubleshooting guide

### Integration Points

1. **CI/CD Integration**

   - Automated analysis in pipelines
   - Quality gate enforcement
   - Report generation
   - Notification system

2. **Development Workflow**
   - Pre-commit hooks
   - Pull request checks
   - Code review tools
   - Documentation updates

### Configuration

1. **Analysis Configuration**

   ```typescript
   interface AnalysisConfig {
     coverage: {
       threshold: number;
       excludePaths: string[];
     };
     quality: {
       complexity: number;
       duplication: number;
       maintainability: number;
     };
     security: {
       severity: 'high' | 'medium' | 'low';
       excludePatterns: string[];
     };
     performance: {
       responseTime: number;
       errorRate: number;
       concurrency: number;
     };
   }
   ```

2. **Report Configuration**
   ```typescript
   interface ReportConfig {
     format: 'html' | 'pdf' | 'markdown';
     sections: string[];
     customMetrics: MetricConfig[];
     outputPath: string;
     notification: NotificationConfig;
   }
   ```

## Database Structure

### Collections Overview

1. **Core Collections**

   - `users` - User accounts and authentication
   - `companies` - Company information and settings
   - `analytics` - System analytics and metrics

2. **Financial Records**

   - `transactions` - Banking transactions
   - `expenses` - Expense records
   - `bankAccounts` - Connected bank accounts
   - `budgets` - Budget tracking

3. **Receipt Management**
   - `receipts` - Receipt records and metadata
   - `merchants` - Merchant information
   - `categories` - Expense categories
   - `tags` - Transaction and expense tags

### Schema Definitions

1. **Users Collection**

   ```typescript
   {
     email: string;          // required, unique
     password: string;       // required, hashed
     firstName: string;      // required
     lastName: string;       // required
     picture: string;        // optional
     googleId: string;       // optional
     isVerified: boolean;    // default: false
     isActive: boolean;      // default: true
     role: enum;            // ['admin', 'user']
     lastLoginAt: Date;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Transactions Collection**

   ```typescript
   {
     userId: ObjectId;       // required, ref: users
     accountId: string;      // required
     date: Date;            // required
     amount: number;        // required
     description: string;   // required
     type: enum;           // ['credit', 'debit', 'transfer']
     status: enum;         // ['pending', 'posted', 'cancelled']
     category: string;     // optional
     isExpense: boolean;   // required
     company: enum;        // ['Down Home', 'Music City Rodeo', 'Personal']
   }
   ```

3. **Receipts Collection**

   ```typescript
   {
     expenseId: ObjectId;   // required, ref: expenses
     userId: ObjectId;      // required, ref: users
     urls: {               // required
       original: string;   // required
       converted: string;  // optional
       thumbnail: string;  // optional
     };
     source: enum;         // ['CSV', 'EMAIL', 'GOOGLE_PHOTOS', 'MANUAL', 'UPLOAD']
     merchant: string;     // required
     amount: number;       // required
     date: Date;          // required
     category: string;     // optional
   }
   ```

4. **Merchants Collection**

   ```typescript
   {
     name: string;         // required
     aliases: string[];    // optional
     category: string;     // optional
     tags: string[];      // optional
     businessDetails: {    // optional
       website: string;
       phone: string;
       address: string;
       taxId: string;
     }
   }
   ```

5. **Bank Accounts Collection**
   ```typescript
   {
     userId: ObjectId;     // required, ref: users
     accountId: string;    // required
     name: string;        // required
     type: enum;         // ['checking', 'savings', 'credit', 'investment']
     balance: number;    // required
     currency: string;   // optional
     institution: string; // optional
     isActive: boolean;  // default: true
     lastSync: Date;     // optional
     createdAt: Date;
     updatedAt: Date;
   }
   ```

### Indexes

1. **Transactions Indexes**

   ```javascript
   {
     'userId': 1,
     'date': -1,
     'amount': -1
   }
   {
     'userId': 1,
     'category': 1,
     'date': -1
   }
   {
     'userId': 1,
     'description': 'text'
   }
   ```

2. **Receipts Indexes**

   ```javascript
   {
     'userId': 1,
     'date': -1
   }
   {
     'merchant': 'text'
   }
   {
     'expenseId': 1
   }
   ```

3. **Merchants Indexes**
   ```javascript
   {
     'name': 'text',
     'aliases': 'text'
   }
   {
     'category': 1
   }
   ```

### Data Relationships

1. **User Data Isolation**

   - All collections include `userId` for data isolation
   - Enforced through schema validation and application logic

2. **Financial Records**

   - Transactions → Bank Accounts (accountId)
   - Expenses → Transactions (transactionId)
   - Receipts → Expenses (expenseId)

3. **Categorization**
   - Transactions → Categories (category)
   - Expenses → Categories (category)
   - Merchants → Categories (category)

### Validation Rules

1. **Schema Validation**

   - All collections have MongoDB schema validation
   - Enforced at moderate level
   - Custom validation in application layer

2. **Data Integrity**
   - Foreign key relationships
   - Required fields
   - Enum values
   - Date ranges
   - Amount validation

### Maintenance Scripts

1. **Database Verification**

   - `scripts/verify-databases.sh`
   - Checks connections
   - Verifies indexes
   - Validates schemas

2. **Database Maintenance**
   - `scripts/database-maintenance.sh`
   - Creates backups
   - Monitors performance
   - Manages retention

// ... existing code ...
