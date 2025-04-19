# Schema Migration Guide

## Overview

This document outlines the migration plan for unifying our database schemas between the backend and types package.

## Current Issues

1. Duplicate schemas in backend and types package
2. Inconsistent base class usage
3. Missing schema exports
4. Inconsistent field types and validation

## Migration Steps

### 1. Schema Cleanup

- Remove all duplicate schemas from backend
- Keep single source of truth in `packages/types/src/schemas/`
- Update backend imports to use types package schemas

### 2. User Schema Migration

- Replace `apps/backend/src/app/models/user.model.ts` with imports from `@fresh-expense/types`
- Update user service to use `UserDocument` from types package
- Migrate existing user data to match new schema

### 3. Expense Schema Migration

- Replace `apps/backend/src/services/expense/expense.schema.ts` with imports from `@fresh-expense/types`
- Update expense service to use `ExpenseDocument` from types package
- Migrate existing expense data to match new schema

### 4. Transaction Schema Updates

- Ensure all transaction-related code uses the unified schema
- Update any custom fields to use the metadata object
- Migrate existing transaction data to match new schema

### 5. Merchant Schema Migration

- Replace all merchant schemas in backend with imports from `@fresh-expense/types`
- Update merchant service to use `MerchantDocument` from types package
- Migrate existing merchant data to match new schema
- Update merchant enrichment service to use new schema
- Update merchant learning service to use new schema

### 6. Subscription Schema Migration

- Replace `apps/backend/src/app/subscriptions/schemas/subscription.schema.ts` with imports from `@fresh-expense/types`
- Update subscription service to use `SubscriptionDocument` from types package
- Migrate existing subscription data to match new schema

### 7. Report Schema Migration

- Replace `apps/backend/src/services/report/report.schema.ts` with imports from `@fresh-expense/types`
- Update report service to use `ReportDocument` from types package
- Migrate existing report data to match new schema

### 8. Backup System Integration

- Update backup scripts to handle new schema fields
- Add backup-specific fields to all documents
- Update restore procedures to handle new schema

## Schema Changes

### Base Schema

Added backup-specific fields:

- `backupId`
- `backupDate`
- `backupSource`
- `backupVersion`
- `backupMetadata`

### User Schema

Unified fields:

- Standardized role enum
- Added company reference
- Enhanced preferences structure
- Added backup fields

### Expense Schema

New features:

- Company reference
- Structured amount with currency
- Enhanced metadata
- Backup fields
- Proper indexing

### Transaction Schema

Updates:

- Enhanced merchant information
- Structured location data
- Backup fields
- Improved indexing

### Merchant Schema

New features:

- Standardized merchant types and statuses
- Enhanced location data with geospatial indexing
- Structured subscription information
- Comprehensive purchase history
- Rich enriched data
- Backup fields
- Proper indexing

### Subscription Schema

Updates:

- Standardized billing cycles
- Enhanced status tracking
- Improved metadata structure
- Backup fields
- Proper indexing

### Report Schema

Updates:

- Unified template structure
- Enhanced filtering options
- Improved scheduling capabilities
- Backup fields
- Proper indexing

## Migration Timeline

1. Week 1: Clean up duplicate schemas and update types package
2. Week 2: Update backend to use unified schemas
3. Week 3: Data migration and testing
4. Week 4: Backup system updates and validation

## Rollback Plan

1. Keep old schemas in place during migration
2. Create backup of all data before migration
3. Document all schema changes
4. Prepare rollback scripts

## Testing

1. Unit tests for all schema changes
2. Integration tests for data migration
3. Backup/restore testing
4. Performance testing with new indexes

## Documentation

1. Update API documentation
2. Update database schema documentation
3. Update backup/restore procedures
4. Document new validation rules
