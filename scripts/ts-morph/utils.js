"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.addSourceFiles = addSourceFiles;
exports.findDuplicateTypes = findDuplicateTypes;
exports.findInconsistentImports = findInconsistentImports;
exports.findAnyTypes = findAnyTypes;
exports.generateTypeReport = generateTypeReport;
const ts_morph_1 = require("ts-morph");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function createProject(tsConfigPath = 'tsconfig.json') {
    try {
        const absolutePath = path.resolve(process.cwd(), tsConfigPath);
        console.log(`Using tsconfig at: ${absolutePath}`);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`tsconfig.json not found at ${absolutePath}`);
        }
        return new ts_morph_1.Project({
            tsConfigFilePath: absolutePath,
            skipAddingFilesFromTsConfig: true,
        });
    }
    catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}
function addSourceFiles(project, patterns) {
    try {
        patterns.forEach(pattern => {
            console.log(`Adding files matching pattern: ${pattern}`);
            const files = project.addSourceFilesAtPaths(pattern);
            console.log(`Found ${files.length} files for pattern ${pattern}`);
        });
    }
    catch (error) {
        console.error('Error adding source files:', error);
        throw error;
    }
}
function findDuplicateTypes(files) {
    const typeMap = new Map();
    try {
        files.forEach(file => {
            const interfaces = file.getInterfaces();
            const typeAliases = file.getTypeAliases();
            [...interfaces, ...typeAliases].forEach(type => {
                const name = type.getName();
                const existing = typeMap.get(name) || [];
                typeMap.set(name, [...existing, file]);
            });
        });
        return new Map([...typeMap.entries()].filter(([_, files]) => files.length > 1));
    }
    catch (error) {
        console.error('Error finding duplicate types:', error);
        throw error;
    }
}
function findInconsistentImports(files) {
    const importMap = new Map();
    try {
        files.forEach(file => {
            const imports = file.getImportDeclarations();
            imports.forEach(imp => {
                const moduleSpecifier = imp.getModuleSpecifierValue();
                const existing = importMap.get(moduleSpecifier) || [];
                importMap.set(moduleSpecifier, [...existing, file.getFilePath()]);
            });
        });
        return new Map([...importMap.entries()].filter(([_, files]) => files.length > 1));
    }
    catch (error) {
        console.error('Error finding inconsistent imports:', error);
        throw error;
    }
}
function findAnyTypes(files) {
    const anyMap = new Map();
    try {
        files.forEach(file => {
            const anyNodes = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.AnyKeyword);
            if (anyNodes.length > 0) {
                anyMap.set(file.getFilePath(), anyNodes.map(node => `Line ${node.getStartLineNumber()}: ${node.getText()}`));
            }
        });
        return anyMap;
    }
    catch (error) {
        console.error('Error finding any types:', error);
        throw error;
    }
}
function generateTypeReport(files) {
    try {
        let report = 'Type Analysis Report\n==================\n\n';
        // Count types
        const interfaces = files.flatMap(f => f.getInterfaces());
        const typeAliases = files.flatMap(f => f.getTypeAliases());
        const classes = files.flatMap(f => f.getClasses());
        const functions = files.flatMap(f => f.getFunctions());
        report += `Total Types Found:\n`;
        report += `- Interfaces: ${interfaces.length}\n`;
        report += `- Type Aliases: ${typeAliases.length}\n`;
        report += `- Classes: ${classes.length}\n`;
        report += `- Functions: ${functions.length}\n\n`;
        // Find duplicates
        const duplicates = findDuplicateTypes(files);
        if (duplicates.size > 0) {
            report += `Duplicate Types Found:\n`;
            duplicates.forEach((files, typeName) => {
                report += `- ${typeName}:\n`;
                files.forEach(file => (report += `  - ${file.getFilePath()}\n`));
            });
            report += '\n';
        }
        // Find inconsistent imports
        const inconsistentImports = findInconsistentImports(files);
        if (inconsistentImports.size > 0) {
            report += `Inconsistent Imports Found:\n`;
            inconsistentImports.forEach((files, importPath) => {
                report += `- ${importPath}:\n`;
                files.forEach(file => (report += `  - ${file}\n`));
            });
            report += '\n';
        }
        // Find any types
        const anyTypes = findAnyTypes(files);
        if (anyTypes.size > 0) {
            report += `Any Types Found:\n`;
            anyTypes.forEach((locations, file) => {
                report += `- ${file}:\n`;
                locations.forEach(loc => (report += `  - ${loc}\n`));
            });
        }
        return report;
    }
    catch (error) {
        console.error('Error generating type report:', error);
        throw error;
    }
}
//# sourceMappingURL=utils.js.map