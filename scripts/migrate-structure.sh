#!/bin/bash

# Backend migration
echo "Migrating backend structure..."

# Core
mkdir -p apps/backend/src/core/{config,database,utils}
mv apps/backend/src/config/* apps/backend/src/core/config/ 2>/dev/null
mv apps/backend/src/db.ts apps/backend/src/core/database/ 2>/dev/null
mv apps/backend/src/db/* apps/backend/src/core/database/ 2>/dev/null
mv apps/backend/src/database/* apps/backend/src/core/database/ 2>/dev/null
mv apps/backend/src/utils/* apps/backend/src/core/utils/ 2>/dev/null

# Shared
mkdir -p apps/backend/src/shared/{decorators,interceptors,middleware,types,utils}
mv apps/backend/src/decorators/* apps/backend/src/shared/decorators/ 2>/dev/null
mv apps/backend/src/interceptors/* apps/backend/src/shared/interceptors/ 2>/dev/null
mv apps/backend/src/middleware/* apps/backend/src/shared/middleware/ 2>/dev/null
mv apps/backend/src/types/* apps/backend/src/shared/types/ 2>/dev/null

# Modules
mkdir -p apps/backend/src/modules/{auth,receipts,expenses}
mv apps/backend/src/auth/* apps/backend/src/modules/auth/ 2>/dev/null
mv apps/backend/src/services/receipts/* apps/backend/src/modules/receipts/ 2>/dev/null
mv apps/backend/src/services/expenses/* apps/backend/src/modules/expenses/ 2>/dev/null

# Frontend migration
echo "Migrating frontend structure..."

# Core
mkdir -p apps/frontend/src/core/{api,config,router,theme,utils}
mv apps/frontend/src/api/* apps/frontend/src/core/api/ 2>/dev/null
mv apps/frontend/src/config/* apps/frontend/src/core/config/ 2>/dev/null
mv apps/frontend/src/router/* apps/frontend/src/core/router/ 2>/dev/null
mv apps/frontend/src/routes/* apps/frontend/src/core/router/ 2>/dev/null
mv apps/frontend/src/theme/* apps/frontend/src/core/theme/ 2>/dev/null
mv apps/frontend/src/utils/* apps/frontend/src/core/utils/ 2>/dev/null

# Shared
mkdir -p apps/frontend/src/shared/{components,hooks,types,utils}
mv apps/frontend/src/components/* apps/frontend/src/shared/components/ 2>/dev/null
mv apps/frontend/src/hooks/* apps/frontend/src/shared/hooks/ 2>/dev/null
mv apps/frontend/src/types/* apps/frontend/src/shared/types/ 2>/dev/null

# Features
mkdir -p apps/frontend/src/features/{auth,receipts,expenses}
mv apps/frontend/src/pages/auth/* apps/frontend/src/features/auth/ 2>/dev/null
mv apps/frontend/src/pages/receipts/* apps/frontend/src/features/receipts/ 2>/dev/null
mv apps/frontend/src/pages/expenses/* apps/frontend/src/features/expenses/ 2>/dev/null

echo "Migration complete. Please review the changes and update imports as needed." 