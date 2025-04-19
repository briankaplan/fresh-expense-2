import * as fs from "node:fs";
import * as path from "node:path";
import {
  ClassDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  Project,
  type SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
} from "ts-morph";

export function createProject(tsConfigPath = "tsconfig.json"): Project {
  try {
    const absolutePath = path.resolve(process.cwd(), tsConfigPath);
    console.log(`Using tsconfig at: ${absolutePath}`);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`tsconfig.json not found at ${absolutePath}`);
    }

    return new Project({
      tsConfigFilePath: absolutePath,
      skipAddingFilesFromTsConfig: true,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export function addSourceFiles(project: Project, patterns: string[]): void {
  try {
    patterns.forEach((pattern) => {
      console.log(`Adding files matching pattern: ${pattern}`);
      const files = project.addSourceFilesAtPaths(pattern);
      console.log(`Found ${files.length} files for pattern ${pattern}`);
    });
  } catch (error) {
    console.error("Error adding source files:", error);
    throw error;
  }
}

export function findDuplicateTypes(files: SourceFile[]): Map<string, SourceFile[]> {
  const typeMap = new Map<string, SourceFile[]>();

  try {
    files.forEach((file) => {
      const interfaces = file.getInterfaces();
      const typeAliases = file.getTypeAliases();

      [...interfaces, ...typeAliases].forEach((type) => {
        const name = type.getName();
        const existing = typeMap.get(name) || [];
        typeMap.set(name, [...existing, file]);
      });
    });

    return new Map([...typeMap.entries()].filter(([_, files]) => files.length > 1));
  } catch (error) {
    console.error("Error finding duplicate types:", error);
    throw error;
  }
}

export function findInconsistentImports(files: SourceFile[]): Map<string, string[]> {
  const importMap = new Map<string, string[]>();

  try {
    files.forEach((file) => {
      const imports = file.getImportDeclarations();
      imports.forEach((imp) => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        const existing = importMap.get(moduleSpecifier) || [];
        importMap.set(moduleSpecifier, [...existing, file.getFilePath()]);
      });
    });

    return new Map([...importMap.entries()].filter(([_, files]) => files.length > 1));
  } catch (error) {
    console.error("Error finding inconsistent imports:", error);
    throw error;
  }
}

export function findAnyTypes(files: SourceFile[]): Map<string, string[]> {
  const anyMap = new Map<string, string[]>();

  try {
    files.forEach((file) => {
      const anyNodes = file.getDescendantsOfKind(SyntaxKind.AnyKeyword);
      if (anyNodes.length > 0) {
        anyMap.set(
          file.getFilePath(),
          anyNodes.map((node) => `Line ${node.getStartLineNumber()}: ${node.getText()}`),
        );
      }
    });

    return anyMap;
  } catch (error) {
    console.error("Error finding any types:", error);
    throw error;
  }
}

export function generateTypeReport(files: SourceFile[]): string {
  try {
    let report = "Type Analysis Report\n==================\n\n";

    // Count types
    const interfaces = files.flatMap((f) => f.getInterfaces());
    const typeAliases = files.flatMap((f) => f.getTypeAliases());
    const classes = files.flatMap((f) => f.getClasses());
    const functions = files.flatMap((f) => f.getFunctions());

    report += "Total Types Found:\n";
    report += `- Interfaces: ${interfaces.length}\n`;
    report += `- Type Aliases: ${typeAliases.length}\n`;
    report += `- Classes: ${classes.length}\n`;
    report += `- Functions: ${functions.length}\n\n`;

    // Find duplicates
    const duplicates = findDuplicateTypes(files);
    if (duplicates.size > 0) {
      report += "Duplicate Types Found:\n";
      duplicates.forEach((files, typeName) => {
        report += `- ${typeName}:\n`;
        files.forEach((file) => (report += `  - ${file.getFilePath()}\n`));
      });
      report += "\n";
    }

    // Find inconsistent imports
    const inconsistentImports = findInconsistentImports(files);
    if (inconsistentImports.size > 0) {
      report += "Inconsistent Imports Found:\n";
      inconsistentImports.forEach((files, importPath) => {
        report += `- ${importPath}:\n`;
        files.forEach((file) => (report += `  - ${file}\n`));
      });
      report += "\n";
    }

    // Find any types
    const anyTypes = findAnyTypes(files);
    if (anyTypes.size > 0) {
      report += "Any Types Found:\n";
      anyTypes.forEach((locations, file) => {
        report += `- ${file}:\n`;
        locations.forEach((loc) => (report += `  - ${loc}\n`));
      });
    }

    return report;
  } catch (error) {
    console.error("Error generating type report:", error);
    throw error;
  }
}
