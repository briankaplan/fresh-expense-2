import * as ts from 'typescript';
import * as fs from 'fs';
import { glob } from 'glob';

const SCHEMA_FILES = 'packages/types/src/**/*.schema.ts';
const BASE_DOCUMENT_FIELDS = [
  '_id!: string;',
  'createdAt!: Date;',
  'updatedAt!: Date;',
  'deletedAt?: Date;',
  'isDeleted!: boolean;'
];

function updateSchemaFile(filePath: string) {
  const sourceText = fs.readFileSync(filePath, 'utf-8');
  ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  let updatedText = sourceText;
  let changesMade = false;

  // Update imports
  if (!sourceText.includes('import { BaseDocument }')) {
    updatedText = updatedText.replace(
      /import { BaseSchema } from ['"].*['"];/,
      'import { BaseDocument } from \'./base.schema\';'
    );
    changesMade = true;
  }

  // Update class declaration and capture class name
  let className = '';
  if (sourceText.includes('extends BaseSchema')) {
    const classMatch = sourceText.match(/export class (\w+) extends BaseSchema/);
    if (classMatch?.[1]) {
      className = classMatch[1];
      updatedText = updatedText.replace(
        /export class (\w+) extends BaseSchema/,
        'export class $1 implements BaseDocument'
      );
      changesMade = true;
    }
  } else {
    const classMatch = sourceText.match(/export class (\w+) implements BaseDocument/);
    if (classMatch?.[1]) {
      className = classMatch[1];
    }
  }

  // Add base document fields if not present
  if (className && !updatedText.includes('_id!: string;')) {
    const classStart = updatedText.indexOf(`export class ${className} implements BaseDocument {`);
    const insertPosition = classStart + `export class ${className} implements BaseDocument {`.length;
    
    updatedText = [
      updatedText.slice(0, insertPosition),
      '\n  ' + BASE_DOCUMENT_FIELDS.join('\n  '),
      updatedText.slice(insertPosition)
    ].join('');
    changesMade = true;
  }

  // Update constructor with correct class name
  if (className) {
    const constructorRegex = /constructor\(partial: Partial<[^>]+>\) {\s*(?:super\(partial\);\s*)?Object\.assign\(this, partial\);\s*}/;
    if (constructorRegex.test(updatedText)) {
      updatedText = updatedText.replace(
        constructorRegex,
        `constructor(partial: Partial<${className}>) {\n    Object.assign(this, partial);\n  }`
      );
      changesMade = true;
    }
  }

  // Add non-null assertions to required fields
  const propRegex = /@Prop\([^)]*\)\s+(\w+)(\?)?:/g;
  let match;
  while ((match = propRegex.exec(updatedText)) !== null) {
    const [fullMatch, , optional] = match;
    if (!optional && !fullMatch.includes('!:')) {
      updatedText = updatedText.replace(fullMatch, fullMatch.replace(':', '!:'));
      changesMade = true;
    }
  }

  if (changesMade) {
    fs.writeFileSync(filePath, updatedText);
    console.log(`Updated ${filePath}`);
  }
}

// Find and process all schema files
async function main() {
  try {
    const files = await glob(SCHEMA_FILES);
    files.forEach((file: string) => {
      try {
        updateSchemaFile(file);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    });
  } catch (error) {
    console.error('Error finding schema files:', error);
  }
}

main(); 