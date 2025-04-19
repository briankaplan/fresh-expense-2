import { Project, SourceFile } from 'ts-morph';
export declare function createProject(tsConfigPath?: string): Project;
export declare function addSourceFiles(project: Project, patterns: string[]): void;
export declare function findDuplicateTypes(files: SourceFile[]): Map<string, SourceFile[]>;
export declare function findInconsistentImports(files: SourceFile[]): Map<string, string[]>;
export declare function findAnyTypes(files: SourceFile[]): Map<string, string[]>;
export declare function generateTypeReport(files: SourceFile[]): string;
//# sourceMappingURL=utils.d.ts.map