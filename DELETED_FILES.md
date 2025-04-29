# Deleted Files Tracking

The following files were deleted during the refactoring:

## Frontend
- apps/frontend/test/unit/components/Button.spec.tsx
- apps/frontend/test/unit/components/Input.spec.tsx
- apps/frontend/src/components/FilterBuilder.tsx
- apps/frontend/src/app/pages/ReportsPage.tsx
- apps/frontend/src/app/pages/AccountsPage.tsx
- apps/frontend/src/app/pages/CategoriesPage.tsx
- apps/frontend/src/app/pages/DashboardPage.tsx
- apps/frontend/src/app/pages/TransactionsPage.tsx
- apps/frontend/src/app/pages/ProfilePage.tsx

## Backend
- apps/backend/src/app/receipts/receipts.controller.ts
- apps/backend/src/app/receipts/receipts.service.ts
- apps/backend/src/services/transaction/transaction.controller.ts
- apps/backend/src/services/receipt-bank/receipt-bank.service.ts
- apps/backend/src/services/receipt-bank/receipt-bank.controller.ts

## API
- apps/api/src/services/merchant/merchants.service.ts
- apps/api/project.json

## Shared Libraries
- libs/shared/utils/src/index.ts
- libs/shared/src/dto/index.ts
- libs/shared/src/dto/user.dto.ts
- libs/shared/src/dto/receipt.dto.ts
- libs/shared/src/dto/category.dto.ts
- libs/shared/src/dto/analytics.dto.ts
- libs/shared/src/dto/create-merchant.dto.ts
- libs/shared/src/dto/update-merchant.dto.ts
- libs/shared/src/enums/transaction.enums.ts
- libs/shared/src/dto/transaction.dto.ts
- libs/shared/tsconfig.json

## Configuration
- cloudflare/pages/project.json
- libs/api-client/tsconfig.json
- libs/auth/tsconfig.json

These files were removed as part of the refactoring process to implement the new R2 service architecture. 