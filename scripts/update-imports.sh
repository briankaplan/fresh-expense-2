#!/bin/bash

# Update backend imports
echo "Updating backend imports..."

# Core imports
find apps/backend/src -type f -name "*.ts" -exec sed -i '' \
  -e 's|from '\''\.\./config|from '\''@/core/config|g' \
  -e 's|from '\''\.\./db|from '\''@/core/database|g' \
  -e 's|from '\''\.\./database|from '\''@/core/database|g' \
  -e 's|from '\''\.\./utils|from '\''@/core/utils|g' \
  {} \;

# Shared imports
find apps/backend/src -type f -name "*.ts" -exec sed -i '' \
  -e 's|from '\''\.\./decorators|from '\''@/shared/decorators|g' \
  -e 's|from '\''\.\./interceptors|from '\''@/shared/interceptors|g' \
  -e 's|from '\''\.\./middleware|from '\''@/shared/middleware|g' \
  -e 's|from '\''\.\./types|from '\''@/shared/types|g' \
  {} \;

# Module imports
find apps/backend/src -type f -name "*.ts" -exec sed -i '' \
  -e 's|from '\''\.\./auth|from '\''@/modules/auth|g' \
  -e 's|from '\''\.\./receipts|from '\''@/modules/receipts|g' \
  -e 's|from '\''\.\./expenses|from '\''@/modules/expenses|g' \
  {} \;

# Update frontend imports
echo "Updating frontend imports..."

# Core imports
find apps/frontend/src -type f -name "*.ts*" -exec sed -i '' \
  -e 's|from '\''\.\./api|from '\''@/core/api|g' \
  -e 's|from '\''\.\./config|from '\''@/core/config|g' \
  -e 's|from '\''\.\./router|from '\''@/core/router|g' \
  -e 's|from '\''\.\./routes|from '\''@/core/router|g' \
  -e 's|from '\''\.\./theme|from '\''@/core/theme|g' \
  -e 's|from '\''\.\./utils|from '\''@/core/utils|g' \
  {} \;

# Shared imports
find apps/frontend/src -type f -name "*.ts*" -exec sed -i '' \
  -e 's|from '\''\.\./components|from '\''@/shared/components|g' \
  -e 's|from '\''\.\./hooks|from '\''@/shared/hooks|g' \
  -e 's|from '\''\.\./types|from '\''@/shared/types|g' \
  {} \;

# Feature imports
find apps/frontend/src -type f -name "*.ts*" -exec sed -i '' \
  -e 's|from '\''\.\./auth|from '\''@/features/auth|g' \
  -e 's|from '\''\.\./receipts|from '\''@/features/receipts|g' \
  -e 's|from '\''\.\./expenses|from '\''@/features/expenses|g' \
  {} \;

echo "Import updates complete. Please review the changes and fix any remaining issues." 