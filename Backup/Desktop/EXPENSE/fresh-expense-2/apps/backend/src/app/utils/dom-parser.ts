import { Injectable, Logger } from '@nestjs/common';
import { JSDOM, DOMWindow, ResourceLoader } from 'jsdom';

export enum ParseType {
  HTML = 'text/html',
  XML = 'text/xml',
  SVG = 'image/svg+xml'
}

export interface ParserOptions {
  /**
   * Whether to run scripts within the document
   */
  runScripts?: boolean;

  /**
   * Base URL to resolve relative URLs against
   */
  baseUrl?: string;

  /**
   * Whether to include external resources like images
   */
  includeResources?: boolean;

  /**
   * Custom error handler for parsing errors
   */
  onError?: (error: Error) => void;
}

interface EnhancedDocument extends Document {
  queryText(text: string): Element | null;
}

@Injectable()
export class DOMParserService {
  private readonly logger = new Logger(DOMParserService.name);

  /**
   * Parse HTML or XML string into a DOM Document
   * @param content - The HTML or XML string to parse
   * @param type - The content type (HTML, XML, or SVG)
   * @param options - Optional parsing configuration
   * @returns DOM Document
   */
  parseFromString(
    content: string,
    type: ParseType = ParseType.HTML,
    options: ParserOptions = {}
  ): EnhancedDocument {
    try {
      // Input validation
      if (!content) {
        throw new Error('Content cannot be empty');
      }

      if (!Object.values(ParseType).includes(type)) {
        throw new Error(`Invalid parse type: ${type}`);
      }

      // Configure JSDOM options
      const jsdomOptions: ConstructorParameters<typeof JSDOM>[1] = {
        url: options.baseUrl || 'http://localhost',
        runScripts: options.runScripts ? 'dangerously' : 'outside-only',
        resources: options.includeResources ? 'usable' : undefined,
        contentType: type
      };

      // Basic HTML validation for common issues
      if (type === ParseType.HTML) {
        this.validateHTML(content);
      }

      // Create DOM
      const dom = new JSDOM(content, jsdomOptions);
      
      // Add custom properties and methods if needed
      this.enhanceDocument(dom.window.document);

      return dom.window.document as EnhancedDocument;

    } catch (error) {
      this.logger.error(`Failed to parse ${type} content:`, error);
      
      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error as Error);
      }

      throw this.normalizeError(error);
    }
  }

  /**
   * Parse HTML and extract specific elements or content
   * @param html - HTML string to parse
   * @param selector - CSS selector to find elements
   * @returns Array of matching elements
   */
  parseAndSelect(html: string, selector: string): Element[] {
    try {
      const doc = this.parseFromString(html, ParseType.HTML);
      return Array.from(doc.querySelectorAll(selector));
    } catch (error) {
      this.logger.error('Failed to parse and select elements:', error);
      throw this.normalizeError(error);
    }
  }

  /**
   * Extract text content from HTML while preserving some structure
   * @param html - HTML string to parse
   * @returns Cleaned text content
   */
  parseAndExtractText(html: string): string {
    try {
      const doc = this.parseFromString(html, ParseType.HTML);
      
      // Remove script and style elements
      doc.querySelectorAll('script, style').forEach(el => el.remove());

      // Replace some elements with newlines
      doc.querySelectorAll('br, p, div, h1, h2, h3, h4, h5, h6').forEach(el => {
        el.after(doc.createTextNode('\n'));
      });

      // Get text and clean up whitespace
      return doc.body.textContent
        ?.replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim() || '';

    } catch (error) {
      this.logger.error('Failed to extract text:', error);
      throw this.normalizeError(error);
    }
  }

  /**
   * Basic HTML validation
   */
  private validateHTML(html: string): void {
    // Check for unclosed tags
    const unclosedTags = html.match(/<([a-z0-9]+)(?![^>]*\/>)[^>]*>/gi)?.filter(tag => {
      const tagName = tag.match(/<([a-z0-9]+)/i)?.[1];
      return tagName && !html.includes(`</${tagName}`);
    });

    if (unclosedTags?.length) {
      throw new Error(`Unclosed HTML tags found: ${unclosedTags.join(', ')}`);
    }

    // Check for malformed tags
    if (/<[^>]*[<>][^>]*>/.test(html)) {
      throw new Error('Malformed HTML tags detected');
    }
  }

  /**
   * Enhance the document with custom properties or methods
   */
  private enhanceDocument(document: Document): void {
    // Add custom query helper
    (document as EnhancedDocument).queryText = function(text: string): Element | null {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: node => 
            node.textContent?.includes(text) 
              ? NodeFilter.FILTER_ACCEPT 
              : NodeFilter.FILTER_REJECT
        }
      );

      const node = walker.nextNode();
      return node?.parentElement || null;
    };
  }

  /**
   * Normalize error messages
   */
  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(
      typeof error === 'string' ? error : 'An error occurred while parsing'
    );
  }
} 