# Database Migrations

This document describes the migration system for the Fresh Expense application.

## Overview

The migration system provides a way to:

- Track schema changes
- Manage data migrations
- Handle versioning
- Support rollbacks
- Maintain data integrity

## Migration Structure

Migrations are organized by version numbers:

- v1.0.0: Initial schema setup
- v1.1.0: Subscription and report schemas
- v2.0.0: Merchant and AI model schemas
- v2.1.0: Analytics and schema updates

## Running Migrations

### Upgrading

To run all pending migrations:

```bash
npm run migrate:up
```

### Rolling Back

To roll back to a specific version:

```bash
npm run migrate:down <version>
```

Example:

```bash
npm run migrate:down 200
```

### Checking Status

To check migration status:

```bash
npm run migrate:status
```

## Migration Process

1. **Version Tracking**

   - Each migration has a unique version number
   - Versions are stored in the database
   - Only unapplied migrations are executed

2. **Schema Updates**

   - Index creation
   - Field additions/modifications
   - Data type changes
   - Validation rules

3. **Data Migrations**

   - Data transformation
   - Field population
   - Data cleanup
   - Relationship updates

4. **Rollback Support**
   - Version-specific rollback logic
   - Data preservation
   - Schema reversion

## Best Practices

1. **Versioning**

   - Use semantic versioning
   - Increment versions sequentially
   - Document changes in each version

2. **Data Safety**

   - Backup data before migrations
   - Test migrations in staging
   - Implement rollback procedures
   - Monitor migration progress

3. **Performance**

   - Batch large operations
   - Use indexes effectively
   - Optimize queries
   - Monitor execution time

4. **Documentation**
   - Document schema changes
   - Record data migrations
   - Note potential issues
   - Update API documentation

## Troubleshooting

### Common Issues

1. **Migration Failure**

   - Check error logs
   - Verify database connection
   - Ensure proper permissions
   - Validate schema changes

2. **Rollback Issues**

   - Verify version number
   - Check rollback logic
   - Ensure data consistency
   - Monitor rollback progress

3. **Performance Problems**
   - Optimize queries
   - Add appropriate indexes
   - Batch large operations
   - Monitor resource usage

### Recovery Steps

1. **Failed Migration**

   - Review error logs
   - Fix underlying issue
   - Run migration again
   - Verify data integrity

2. **Partial Migration**

   - Identify completed steps
   - Roll back to last good state
   - Fix the issue
   - Resume migration

3. **Data Corruption**
   - Restore from backup
   - Verify data integrity
   - Re-run migrations
   - Update documentation

## Version History

### v2.1.0

- Added analytics schema
- Updated existing schemas
- Added metadata tracking
- Enhanced indexing

### v2.0.0

- Added merchant schema
- Added AI model schema
- Added OCR schema
- Updated relationships

### v1.1.0

- Added subscription schema
- Added report schema
- Enhanced user schema
- Updated transaction schema

### v1.0.0

- Initial schema setup
- User management
- Transaction tracking
- Receipt processing
- Expense management
