import * as path from "path";
import { ImportDeclaration, Project, SyntaxKind } from "ts-morph";

// Types that should be imported from @fresh-expense/types
const CENTRALIZED_TYPES = [
  "User",
  "AuthResponse",
  "UserSettings",
  "ApiError",
  "Transaction",
  "TransactionAmount",
  "TransactionMerchant",
  "TransactionLocation",
  "TransactionMetrics",
  "Receipt",
  "ReceiptLocation",
  "ReceiptOCRData",
  "ReceiptMetadata",
  "Merchant",
  "Category",
  "ExpenseCategory",
  "ExpenseCategoryType",
  "CategoryDisplay",
  "ApiResponse",
  "PaginatedResponse",
  "SortOptions",
  "FilterOptions",
  "ProcessedData",
  "ExtractedReceiptData",
  "VerificationResult",
];

async function updateImports() {
  try {
    console.log("Initializing project...");
    const project = new Project({
      tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    });

    // Add source files
    console.log("Adding source files...");
    const patterns = [
      "apps/backend/src/**/*.ts",
      "apps/frontend/src/**/*.ts",
      "apps/frontend/src/**/*.tsx",
      "packages/utils/src/**/*.ts",
    ];

    project.addSourceFilesAtPaths(patterns);
    const files = project.getSourceFiles();
    console.log(`Found ${files.length} source files`);

    let updatedFiles = 0;
    let updatedImports = 0;

    for (const file of files) {
      const imports = file.getImportDeclarations();
      let fileUpdated = false;
      const typesToMove: string[] = [];

      for (const imp of imports) {
        const namedImports = imp.getNamedImports();
        const typesToRemove = namedImports.filter((ni) => CENTRALIZED_TYPES.includes(ni.getName()));

        if (typesToRemove.length > 0) {
          // Store the names before removing
          typesToRemove.forEach((t) => typesToMove.push(t.getName()));

          // Remove these types from current import
          typesToRemove.forEach((t) => t.remove());

          // If no named imports left, remove the entire import
          if (imp.getNamedImports().length === 0) {
            imp.remove();
          }

          fileUpdated = true;
        }
      }

      if (typesToMove.length > 0) {
        // Add import from @fresh-expense/types
        const typesImport = file.getImportDeclaration(
          (i) => i.getModuleSpecifierValue() === "@fresh-expense/types",
        );

        if (!typesImport) {
          file.addImportDeclaration({
            moduleSpecifier: "@fresh-expense/types",
            namedImports: typesToMove,
          });
        } else {
          typesImport.addNamedImports(typesToMove);
        }

        updatedImports += typesToMove.length;
      }

      if (fileUpdated) {
        file.saveSync();
        updatedFiles++;
      }
    }

    console.log("\nUpdate complete:");
    console.log(`- Updated ${updatedFiles} files`);
    console.log(`- Moved ${updatedImports} type imports to @fresh-expense/types`);
  } catch (error) {
    console.error("Error updating imports:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Run the update
updateImports().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
