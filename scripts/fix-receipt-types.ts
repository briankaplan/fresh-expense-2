import chalk from "chalk";
import { globSync } from "glob";
import { Node, Project, SyntaxKind } from "ts-morph";

/**
 * Valid receipt status values as defined in our types
 */
const VALID_RECEIPT_STATUS = ["pending", "processed", "matched", "review"] as const;

/**
 * Default currency for amount fields
 */
const DEFAULT_CURRENCY = "USD";

/**
 * Main function to analyze receipt type issues in the codebase
 */
async function analyzeReceiptTypes() {
  try {
    // Initialize TypeScript project
    const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

    // Find all TypeScript files
    const files = globSync("src/**/*.{ts,tsx}");

    console.log(chalk.blue(`🔍 Analyzing ${files.length} files...`));

    const analysisResults = {
      dateFields: [] as string[],
      amountFields: [] as string[],
      merchantFields: [] as string[],
      statusFields: [] as string[],
      unusedImports: [] as string[],
    };

    for (const filePath of files) {
      const sourceFile = project.addSourceFileAtPath(filePath);
      let hasChanges = false;

      // Process each file
      sourceFile.forEachDescendant((node) => {
        if (Node.isPropertyAssignment(node)) {
          const name = node.getName();
          const value = node.getInitializer();

          // Check date fields
          if (["createdAt", "updatedAt", "date"].includes(name) && Node.isStringLiteral(value)) {
            analysisResults.dateFields.push(`${filePath}:${node.getStartLineNumber()}`);
            hasChanges = true;
          }

          // Check amount fields
          if (name === "amount" && Node.isNumericLiteral(value)) {
            analysisResults.amountFields.push(`${filePath}:${node.getStartLineNumber()}`);
            hasChanges = true;
          }

          // Check merchant fields
          if (name === "merchant" && Node.isStringLiteral(value)) {
            analysisResults.merchantFields.push(`${filePath}:${node.getStartLineNumber()}`);
            hasChanges = true;
          }

          // Check status values
          if (name === "status" && Node.isStringLiteral(value)) {
            const raw = value.getLiteralText();
            if (!VALID_RECEIPT_STATUS.includes(raw as any)) {
              analysisResults.statusFields.push(`${filePath}:${node.getStartLineNumber()}`);
              hasChanges = true;
            }
          }
        }
      });

      // Check for unused imports
      sourceFile.getImportDeclarations().forEach((importDecl) => {
        const namedImports = importDecl.getNamedImports();
        const used = namedImports.filter((n) => {
          const name = n.getNameNode().getText();
          return sourceFile
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .some((i) => i.getText() === name);
        });

        if (used.length === 0 && namedImports.length > 0) {
          analysisResults.unusedImports.push(`${filePath}:${importDecl.getStartLineNumber()}`);
          hasChanges = true;
        }
      });
    }

    // Print analysis results
    console.log(chalk.green.bold("\n📊 Analysis Results:"));

    if (analysisResults.dateFields.length > 0) {
      console.log(chalk.yellow("\n📅 Date fields to fix:"));
      analysisResults.dateFields.forEach((file) => console.log(chalk.cyan(`  ${file}`)));
    }

    if (analysisResults.amountFields.length > 0) {
      console.log(chalk.yellow("\n💰 Amount fields to fix:"));
      analysisResults.amountFields.forEach((file) => console.log(chalk.cyan(`  ${file}`)));
    }

    if (analysisResults.merchantFields.length > 0) {
      console.log(chalk.yellow("\n🏪 Merchant fields to fix:"));
      analysisResults.merchantFields.forEach((file) => console.log(chalk.cyan(`  ${file}`)));
    }

    if (analysisResults.statusFields.length > 0) {
      console.log(chalk.yellow("\n📊 Status fields to fix:"));
      analysisResults.statusFields.forEach((file) => console.log(chalk.cyan(`  ${file}`)));
    }

    if (analysisResults.unusedImports.length > 0) {
      console.log(chalk.yellow("\n🗑️ Unused imports to remove:"));
      analysisResults.unusedImports.forEach((file) => console.log(chalk.cyan(`  ${file}`)));
    }

    // Print summary
    const totalChanges = Object.values(analysisResults).reduce((sum, arr) => sum + arr.length, 0);
    console.log(chalk.green.bold(`\n✨ Total changes needed: ${totalChanges}`));
  } catch (error) {
    console.error(chalk.red("❌ Error during analysis:"));
    console.error(error);
    process.exit(1);
  }
}

// Run the analysis
analyzeReceiptTypes();
