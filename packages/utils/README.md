# Fresh Expense Utils

Shared utilities for the Fresh Expense application.

## Features

- Common utility functions and helpers
- Shared constants and configurations
- Type definitions and interfaces
- Error handling utilities
- Validation helpers
- Date and time utilities
- String manipulation functions
- Number formatting utilities

## Installation

```bash
pnpm add @fresh-expense/utils
```

## Usage

```typescript
import { formatCurrency, parseDate } from '@fresh-expense/utils';

// Format currency
const formattedAmount = formatCurrency(1234.56); // "$1,234.56"

// Parse date
const date = parseDate('2024-03-15'); // Date object
```

## Development

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the package:
   ```bash
   pnpm build
   ```

### Testing

Run tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm test:cov
```

### Linting

Run linter:

```bash
pnpm lint
```

Fix linting issues:

```bash
pnpm lint:fix
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Add tests for new functionality
4. Run tests and ensure they pass
5. Submit a pull request

## License

MIT
