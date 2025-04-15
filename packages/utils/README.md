# @packages/utils

Shared utilities for the expense application. This package provides a collection of reusable functions and utilities for handling common tasks across the application.

## Installation

```bash
pnpm add @packages/utils
```

## Features

### String Comparison

- `normalizeText`: Normalize text for comparison
- `calculateLevenshteinDistance`: Calculate edit distance between strings
- `calculateLevenshteinSimilarity`: Calculate similarity ratio between strings
- `calculateJaccardSimilarity`: Calculate Jaccard similarity between texts

### Receipt Matching

- `calculateMerchantMatchScore`: Calculate similarity between merchant names
- `calculateAmountMatchScore`: Compare transaction amounts
- `calculateDateMatchScore`: Compare transaction dates
- `findBestReceiptMatch`: Find the best matching receipt for a transaction

### Image Processing

- `convertPdfToImages`: Convert PDF files to images
- `optimizeImage`: Optimize images with various options
- `generateThumbnail`: Create thumbnails from images
- `extractImageMetadata`: Extract metadata from images

### Cloudflare R2

- `createR2Client`: Create an S3 client for Cloudflare R2
- `getSignedDownloadUrl`: Generate signed URLs for downloading
- `getSignedUploadUrl`: Generate signed URLs for uploading
- `getPublicUrl`: Get public URLs for R2 objects
- `generateStorageKey`: Generate unique storage keys

### Merchant Analysis

- Category Utils:

  - `isValidCategory`: Check if a category is valid
  - `normalizeCategory`: Normalize category strings
  - `getCategoryDisplayName`: Get display names for categories

- Subscription Detection:

  - `detectSubscription`: Detect subscription patterns
  - `calculateFrequency`: Calculate transaction frequency

- Transaction Analysis:
  - `analyzeTransactions`: Analyze transaction patterns
  - `determineCategory`: Determine dominant category

## Usage

```typescript
import {
  normalizeText,
  calculateLevenshteinSimilarity,
  detectSubscription,
  analyzeTransactions,
  convertPdfToImages,
  createR2Client,
} from '@packages/utils';

// String comparison
const similarity = calculateLevenshteinSimilarity('text1', 'text2');

// Subscription detection
const subscription = detectSubscription(transactions);

// Transaction analysis
const analysis = analyzeTransactions(transactions);

// Image processing
const images = await convertPdfToImages(pdfBuffer, {
  width: 1200,
  quality: 80,
});

// R2 storage
const r2Client = createR2Client({
  accountId: 'your-account-id',
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  bucket: 'your-bucket',
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

MIT
