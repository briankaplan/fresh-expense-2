const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
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
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const utils_1 = require("./utils");
async function performRefactoring() {
  const project = (0, utils_1.createProject)();
  (0, utils_1.addSourceFiles)(project, ["apps/**/*.ts", "apps/**/*.tsx", "packages/**/*.ts"]);
  const reportDir = path.join(process.cwd(), "reports");
  const planPath = path.join(reportDir, "refactor-plan.txt");
  if (!fs.existsSync(planPath)) {
    console.error("No refactoring plan found. Please run ts-morph:analyze first.");
    return;
  }
  const planContent = fs.readFileSync(planPath, "utf-8");
  const refactorPlan = new Map(
    planContent
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [type, file] = line.split(" -> ");
        return [type.trim(), file.trim()];
      }),
  );
  console.log("Starting refactoring...");
  refactorPlan.forEach((targetFile, typeName) => {
    const files = project.getSourceFiles();
    const typeDeclarations = files.flatMap((file) => {
      const interfaces = file.getInterfaces().filter((i) => i.getName() === typeName);
      const typeAliases = file.getTypeAliases().filter((t) => t.getName() === typeName);
      return [...interfaces, ...typeAliases];
    });
    if (typeDeclarations.length <= 1) {
      console.log(`Skipping ${typeName} - no duplicates found`);
      return;
    }
    // Get the target file
    const targetSourceFile = project.getSourceFile(targetFile);
    if (!targetSourceFile) {
      console.error(`Target file not found: ${targetFile}`);
      return;
    }
    // Get the first declaration (this will be our source of truth)
    const sourceDeclaration = typeDeclarations[0];
    const sourceText = sourceDeclaration.getText();
    // Add the type to the target file if it doesn't exist
    if (!targetSourceFile.getInterface(typeName) && !targetSourceFile.getTypeAlias(typeName)) {
      targetSourceFile.addStatements(`\n${sourceText}\n`);
    }
    // Remove the type from all other files
    typeDeclarations.slice(1).forEach((declaration) => {
      const file = declaration.getSourceFile();
      if (file.getFilePath() !== targetFile) {
        declaration.remove();
      }
    });
    // Update imports in files that used the type
    files.forEach((file) => {
      if (file.getFilePath() === targetFile) {
        return;
      }
      const imports = file.getImportDeclarations();
      const hasType = file.getText().includes(typeName);
      if (hasType) {
        // Check if we already import from the target file
        const existingImport = imports.find((imp) => imp.getModuleSpecifierValue() === targetFile);
        if (!existingImport) {
          // Add import from the target file
          file.addImportDeclaration({
            moduleSpecifier: targetFile,
            namedImports: [typeName],
          });
        }
      }
    });
  });
  // Save all changes
  project.saveSync();
  console.log("Refactoring completed. Please review the changes and run tests.");
}
performRefactoring().catch(console.error);
//# sourceMappingURL=perform-refactor.js.map
