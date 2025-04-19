Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("node:child_process");
const fs_1 = require("node:fs");
const path_1 = require("node:path");
// Get the root directory (two levels up from scripts)
const rootDir = (0, path_1.join)(__dirname, "..");
const backendDir = (0, path_1.join)(rootDir, "apps", "backend", "src");
// Find all TypeScript files in the backend directory
const findCommand = `find ${backendDir} -type f -name "*.ts"`;
let files = [];
try {
  const output = (0, child_process_1.execSync)(findCommand, { encoding: "utf8" });
  files = output.split("\n").filter(Boolean);
} catch (error) {
  console.error("Error finding files:", error);
  process.exit(1);
}
// Schema imports to update
const schemaImports = [
  "UserDocument",
  "TransactionDocument",
  "ExpenseDocument",
  "ReceiptDocument",
  "MerchantDocument",
  "SubscriptionDocument",
  "ReportDocument",
];
// Update each file
for (const file of files) {
  try {
    let content = (0, fs_1.readFileSync)(file, "utf8");
    let modified = false;
    // Check for schema imports
    for (const schema of schemaImports) {
      const importPattern = new RegExp(`import.*${schema}.*from.*['"](.*)['"]`, "g");
      const matches = content.match(importPattern);
      if (matches) {
        // Update the import path to use the types package
        const newImport = `import { ${schema} } from '@fresh-expense/types';`;
        content = content.replace(importPattern, newImport);
        modified = true;
      }
    }
    if (modified) {
      (0, fs_1.writeFileSync)(file, content);
      console.log(`Updated imports in ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
}
console.log("Import update complete");
//# sourceMappingURL=update-schema-imports.js.map
