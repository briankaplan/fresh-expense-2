import { exec } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import * as glob from "glob";
import * as ts from "typescript";

const execAsync = promisify(exec);

interface DependencyNode {
  file: string;
  imports: string[];
  exports: string[];
  typeIssues: TypeIssue[];
  circularDeps: string[];
}

interface TypeIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  relatedFiles: string[];
}

interface AnalysisReport {
  dependencyGraph: Record<string, DependencyNode>;
  circularDependencies: string[][];
  typeIssues: TypeIssue[];
  recommendations: string[];
}

async function analyzeCodebase(): Promise<AnalysisReport> {
  const report: AnalysisReport = {
    dependencyGraph: {},
    circularDependencies: [],
    typeIssues: [],
    recommendations: [],
  };

  // Find all TypeScript files
  const files = glob.sync("**/*.ts", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  });

  // Build dependency graph
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

    const node: DependencyNode = {
      file,
      imports: [],
      exports: [],
      typeIssues: [],
      circularDeps: [],
    };

    // Analyze imports
    ts.forEachChild(sourceFile, (child) => {
      if (ts.isImportDeclaration(child)) {
        const importPath = child.moduleSpecifier.getText().replace(/['"]/g, "");
        node.imports.push(importPath);
      }
    });

    // Analyze exports
    ts.forEachChild(sourceFile, (child) => {
      if (ts.isExportDeclaration(child)) {
        const exportPath = child.moduleSpecifier?.getText().replace(/['"]/g, "");
        if (exportPath) {
          node.exports.push(exportPath);
        }
      }
    });

    report.dependencyGraph[file] = node;
  }

  // Find circular dependencies
  for (const [file, node] of Object.entries(report.dependencyGraph)) {
    const visited = new Set<string>();
    const path: string[] = [];

    function findCircularDeps(currentFile: string) {
      if (visited.has(currentFile)) {
        const cycleStart = path.indexOf(currentFile);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          if (cycle.length > 1) {
            report.circularDependencies.push([...cycle, currentFile]);
          }
        }
        return;
      }

      visited.add(currentFile);
      path.push(currentFile);

      const currentNode = report.dependencyGraph[currentFile];
      if (currentNode) {
        for (const imp of currentNode.imports) {
          const resolvedImport = resolveImportPath(currentFile, imp);
          if (resolvedImport) {
            findCircularDeps(resolvedImport);
          }
        }
      }

      path.pop();
      visited.delete(currentFile);
    }

    findCircularDeps(file);
  }

  // Run TypeScript compiler to get type issues
  try {
    const { stdout } = await execAsync("npx tsc --noEmit --pretty false");
    const typeIssues = parseTypeScriptIssues(stdout);
    report.typeIssues = typeIssues;

    // Map type issues to files
    for (const issue of typeIssues) {
      const node = report.dependencyGraph[issue.file];
      if (node) {
        node.typeIssues.push(issue);
      }
    }
  } catch (error) {
    console.error("Error running TypeScript check:", error);
  }

  // Generate recommendations
  report.recommendations = generateRecommendations(report);

  return report;
}

function resolveImportPath(sourceFile: string, importPath: string): string | null {
  // Basic path resolution - you might want to enhance this
  if (importPath.startsWith(".")) {
    return `${path.resolve(path.dirname(sourceFile), importPath)}.ts`;
  }
  return null;
}

function parseTypeScriptIssues(output: string): TypeIssue[] {
  const issues: TypeIssue[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    if (line.includes("error TS")) {
      const match = line.match(/^(.+?):(\d+):(\d+) - error TS(\d+): (.+)$/);
      if (match) {
        const [, file, lineStr, columnStr, code, message] = match;
        if (file && lineStr && columnStr && code && message) {
          issues.push({
            file,
            line: Number.parseInt(lineStr),
            column: Number.parseInt(columnStr),
            message,
            code: `TS${code}`,
            relatedFiles: [],
          });
        }
      }
    }
  }

  return issues;
}

function generateRecommendations(report: AnalysisReport): string[] {
  const recommendations: string[] = [];

  // Prioritize circular dependencies
  if (report.circularDependencies.length > 0) {
    recommendations.push("1. Fix circular dependencies:");
    report.circularDependencies.forEach((cycle, index) => {
      recommendations.push(`   ${index + 1}. ${cycle.join(" -> ")}`);
    });
  }

  // Group type issues by file
  const issuesByFile = new Map<string, TypeIssue[]>();
  report.typeIssues.forEach((issue) => {
    if (!issuesByFile.has(issue.file)) {
      issuesByFile.set(issue.file, []);
    }
    issuesByFile.get(issue.file)?.push(issue);
  });

  // Sort files by number of issues
  const sortedFiles = Array.from(issuesByFile.entries()).sort((a, b) => b[1].length - a[1].length);

  if (sortedFiles.length > 0) {
    recommendations.push("\n2. Fix type issues in these files (ordered by severity):");
    sortedFiles.forEach(([file, issues]) => {
      recommendations.push(`   - ${file} (${issues.length} issues)`);
    });
  }

  // Add dependency recommendations
  recommendations.push("\n3. Review and optimize imports:");
  Object.entries(report.dependencyGraph).forEach(([file, node]) => {
    if (node.imports.length > 10) {
      recommendations.push(`   - ${file} has ${node.imports.length} imports, consider splitting`);
    }
  });

  return recommendations;
}

async function main() {
  console.log("Analyzing codebase...");
  const report = await analyzeCodebase();

  // Save report to file
  const reportPath = path.join(process.cwd(), "codebase-analysis.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\nAnalysis complete! Report saved to:", reportPath);
  console.log("\nKey Findings:");
  console.log(`- Found ${report.circularDependencies.length} circular dependencies`);
  console.log(`- Found ${report.typeIssues.length} type issues`);
  console.log(`- Analyzed ${Object.keys(report.dependencyGraph).length} files`);

  console.log("\nTop Recommendations:");
  report.recommendations.slice(0, 5).forEach((rec) => console.log(rec));
}

main().catch(console.error);
