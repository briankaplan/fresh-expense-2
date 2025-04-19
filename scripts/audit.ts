import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as glob from "glob";
import * as ts from "typescript";

const execAsync = promisify(exec);

interface Issue {
  file: string;
  line: number;
  column: number;
  message: string;
  type: "type" | "lint" | "test" | "dependency" | "circular" | "import";
  severity: "error" | "warning";
  category: string;
  relatedFiles?: string[];
}

interface AuditReport {
  summary: {
    totalIssues: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  };
  issues: Issue[];
  recommendations: string[];
  dependencyGraph: Record<
    string,
    {
      imports: string[];
      exports: string[];
      circularDeps: string[];
    }
  >;
}

async function runTypeScriptCheck(): Promise<string> {
  const { stdout } = await execAsync("npx tsc --noEmit --pretty false");
  return stdout;
}

async function runESLint(): Promise<string> {
  const { stdout } = await execAsync("npx eslint . --format json");
  return stdout;
}

async function runTests(): Promise<string> {
  const { stdout } = await execAsync("npm test -- --json");
  return stdout;
}

async function checkDependencies(): Promise<string> {
  const { stdout } = await execAsync("npm audit --json");
  return stdout;
}

function parseTypeScriptIssues(output: string): Issue[] {
  const issues: Issue[] = [];
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
            type: "type",
            severity: "error",
            category: "TypeScript",
            relatedFiles: findRelatedFiles(file, message),
          });
        }
      }
    }
  }

  return issues;
}

function parseESLintIssues(output: string): Issue[] {
  const issues: Issue[] = [];
  const results = JSON.parse(output);

  for (const result of results) {
    for (const message of result.messages) {
      issues.push({
        file: result.filePath,
        line: message.line,
        column: message.column,
        message: message.message,
        type: "lint",
        severity: message.severity === 2 ? "error" : "warning",
        category: "ESLint",
        relatedFiles: findRelatedFiles(result.filePath, message.message),
      });
    }
  }

  return issues;
}

function parseTestIssues(output: string): Issue[] {
  const issues: Issue[] = [];
  const results = JSON.parse(output);

  for (const test of results.testResults) {
    for (const failure of test.failureMessages) {
      issues.push({
        file: test.name,
        line: 0,
        column: 0,
        message: failure,
        type: "test",
        severity: "error",
        category: "Test",
        relatedFiles: findRelatedFiles(test.name, failure),
      });
    }
  }

  return issues;
}

function parseDependencyIssues(output: string): Issue[] {
  const issues: Issue[] = [];
  const results = JSON.parse(output);

  for (const [name, advisory] of Object.entries(results.advisories || {})) {
    const typedAdvisory = advisory as { title: string; severity: string };
    issues.push({
      file: "package.json",
      line: 0,
      column: 0,
      message: `${name}: ${typedAdvisory.title}`,
      type: "dependency",
      severity:
        typedAdvisory.severity === "high" || typedAdvisory.severity === "critical"
          ? "error"
          : "warning",
      category: "Dependency",
    });
  }

  return issues;
}

function findRelatedFiles(file: string, message: string): string[] {
  const relatedFiles: string[] = [];
  const content = fs.readFileSync(file, "utf-8");
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

  // Find imports that might be related to the issue
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.getText().replace(/['"]/g, "");
      if (message.includes(importPath)) {
        const resolvedPath = resolveImportPath(file, importPath);
        if (resolvedPath) {
          relatedFiles.push(resolvedPath);
        }
      }
    }
  });

  return relatedFiles;
}

function resolveImportPath(sourceFile: string, importPath: string): string | null {
  if (importPath.startsWith(".")) {
    return path.resolve(path.dirname(sourceFile), importPath) + ".ts";
  }
  return null;
}

async function analyzeDependencies(): Promise<
  Record<string, { imports: string[]; exports: string[]; circularDeps: string[] }>
> {
  const dependencyGraph: Record<
    string,
    { imports: string[]; exports: string[]; circularDeps: string[] }
  > = {};
  const files = glob.sync("**/*.ts", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  });

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

    const imports: string[] = [];
    const exports: string[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const importPath = node.moduleSpecifier.getText().replace(/['"]/g, "");
        imports.push(importPath);
      }
      if (ts.isExportDeclaration(node)) {
        const exportPath = node.moduleSpecifier?.getText().replace(/['"]/g, "");
        if (exportPath) {
          exports.push(exportPath);
        }
      }
    });

    dependencyGraph[file] = {
      imports,
      exports,
      circularDeps: [],
    };
  }

  // Find circular dependencies
  for (const [file, node] of Object.entries(dependencyGraph)) {
    const visited = new Set<string>();
    const path: string[] = [];

    function findCircularDeps(currentFile: string) {
      if (visited.has(currentFile)) {
        const cycleStart = path.indexOf(currentFile);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          if (cycle.length > 1) {
            node.circularDeps.push(...cycle);
          }
        }
        return;
      }

      visited.add(currentFile);
      path.push(currentFile);

      const currentNode = dependencyGraph[currentFile];
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

  return dependencyGraph;
}

async function generateReport(): Promise<AuditReport> {
  const issues: Issue[] = [];
  const dependencyGraph = await analyzeDependencies();

  try {
    const tsOutput = await runTypeScriptCheck();
    issues.push(...parseTypeScriptIssues(tsOutput));
  } catch (error) {
    console.error("Error running TypeScript check:", error);
  }

  try {
    const eslintOutput = await runESLint();
    issues.push(...parseESLintIssues(eslintOutput));
  } catch (error) {
    console.error("Error running ESLint:", error);
  }

  try {
    const testOutput = await runTests();
    issues.push(...parseTestIssues(testOutput));
  } catch (error) {
    console.error("Error running tests:", error);
  }

  try {
    const depOutput = await checkDependencies();
    issues.push(...parseDependencyIssues(depOutput));
  } catch (error) {
    console.error("Error checking dependencies:", error);
  }

  // Add circular dependency issues
  for (const [file, node] of Object.entries(dependencyGraph)) {
    if (node.circularDeps.length > 0) {
      issues.push({
        file,
        line: 0,
        column: 0,
        message: `Circular dependency detected: ${node.circularDeps.join(" -> ")}`,
        type: "circular",
        severity: "error",
        category: "Dependency",
        relatedFiles: node.circularDeps,
      });
    }
  }

  // Generate summary
  const summary = {
    totalIssues: issues.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
  };

  for (const issue of issues) {
    summary.byType[issue.type] = (summary.byType[issue.type] || 0) + 1;
    summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] || 0) + 1;
    summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;
  }

  // Generate recommendations
  const recommendations = [
    "1. Fix circular dependencies first as they can cause cascading issues",
    "2. Address TypeScript errors as they affect type safety",
    "3. Fix failing tests to ensure functionality",
    "4. Update outdated dependencies with security vulnerabilities",
    "5. Address ESLint issues to maintain code quality",
    "6. Review and optimize imports in files with many dependencies",
  ];

  return {
    summary,
    issues,
    recommendations,
    dependencyGraph,
  };
}

async function main() {
  console.log("Running comprehensive audit...");
  const report = await generateReport();

  // Save report to file
  const reportPath = path.join(process.cwd(), "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\nAudit complete! Report saved to:", reportPath);
  console.log("\nSummary:");
  console.log(`Total Issues: ${report.summary.totalIssues}`);
  console.log("\nBy Type:");
  console.log(JSON.stringify(report.summary.byType, null, 2));
  console.log("\nBy Severity:");
  console.log(JSON.stringify(report.summary.bySeverity, null, 2));
  console.log("\nBy Category:");
  console.log(JSON.stringify(report.summary.byCategory, null, 2));

  console.log("\nTop Recommendations:");
  report.recommendations.forEach((rec) => console.log(rec));

  // Print circular dependencies
  const circularDeps = Object.entries(report.dependencyGraph).filter(
    ([_, node]) => node.circularDeps.length > 0,
  );

  if (circularDeps.length > 0) {
    console.log("\nCircular Dependencies Found:");
    circularDeps.forEach(([file, node]) => {
      console.log(`\n${file}:`);
      console.log(`  Circular path: ${node.circularDeps.join(" -> ")}`);
    });
  }
}

main().catch(console.error);
