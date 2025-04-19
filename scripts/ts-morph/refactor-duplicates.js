var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function refactorDuplicateTypes() {
  try {
    console.log("Initializing project...");
    const project = (0, utils_1.createProject)();
    console.log("Adding source files...");
    const patterns = [
      "apps/backend/src/**/*.ts",
      "apps/frontend/src/**/*.ts",
      "apps/frontend/src/**/*.tsx",
      "packages/types/src/**/*.ts",
      "packages/utils/src/**/*.ts",
    ];
    console.log("Searching for files matching patterns:", patterns);
    (0, utils_1.addSourceFiles)(project, patterns);
    const files = project.getSourceFiles();
    console.log(`Found ${files.length} source files`);
    if (files.length === 0) {
      console.error("No source files found. Check your patterns and project structure.");
      return;
    }
    console.log("Analyzing for duplicate types...");
    const duplicates = (0, utils_1.findDuplicateTypes)(files);
    if (duplicates.size === 0) {
      console.log("No duplicate types found.");
      return;
    }
    // Create a report directory if it doesn't exist
    const reportDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportDir)) {
      console.log("Creating reports directory...");
      fs.mkdirSync(reportDir);
    }
    console.log("Generating type report...");
    const report = (0, utils_1.generateTypeReport)(files);
    const reportPath = path.join(reportDir, "type-analysis-report.txt");
    fs.writeFileSync(reportPath, report);
    console.log(`Report saved to ${reportPath}`);
    console.log("\nFound duplicate types:");
    duplicates.forEach((files, typeName) => {
      console.log(`\n${typeName}:`);
      files.forEach((file) => console.log(`  - ${file.getFilePath()}`));
    });
    // Create a plan for refactoring
    const refactorPlan = new Map();
    console.log("\nCreating refactoring plan...");
    duplicates.forEach((files, typeName) => {
      // Determine the best location for the type
      const packageTypes = files.find((f) => f.getFilePath().includes("packages/types"));
      if (packageTypes) {
        refactorPlan.set(typeName, packageTypes.getFilePath());
      } else {
        // If no package types file, use the first occurrence
        refactorPlan.set(typeName, files[0].getFilePath());
      }
    });
    // Save the refactoring plan
    const planPath = path.join(reportDir, "refactor-plan.txt");
    const planContent = Array.from(refactorPlan.entries())
      .map(([type, file]) => `${type} -> ${file}`)
      .join("\n");
    fs.writeFileSync(planPath, planContent);
    console.log(`Refactoring plan saved to ${planPath}`);
    console.log("\nAnalysis complete. To proceed with refactoring, run:");
    console.log("pnpm ts-morph:refactor");
  } catch (error) {
    console.error("Error during analysis:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
  }
}
// Run the analysis
refactorDuplicateTypes().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
//# sourceMappingURL=refactor-duplicates.js.map
