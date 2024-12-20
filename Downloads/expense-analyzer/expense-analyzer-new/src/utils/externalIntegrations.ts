'use client';

import { google } from 'googleapis';
import { Dropbox } from 'dropbox';
import { ChaseTransaction } from '@/types';
import { Logger } from '@/utils/logger';
import { templates, applyTemplate } from './exportTemplateBuilder';

// Google Sheets Integration
interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string[];
}

interface DropboxConfig {
  appKey: string;
  appSecret: string;
  redirectUri: string;
}

class ExternalIntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ExternalIntegrationError';
  }
}

export class GoogleSheetsExporter {
  private sheets: any;
  private auth: any;

  constructor(private config: GoogleSheetsConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async authorize(token?: string): Promise<string> {
    if (token) {
      this.auth.setCredentials({ access_token: token });
      return token;
    }

    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scope || ['https://www.googleapis.com/auth/spreadsheets']
    });

    return authUrl;
  }

  async exportTransactions(
    transactions: ChaseTransaction[],
    options: {
      sheetName?: string;
      template?: string;
      append?: boolean;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<void> {
    try {
      const {
        sheetName = 'Transactions',
        template = 'standard',
        append = true,
        dateRange
      } = options;

      // Filter transactions by date range if provided
      let filteredTransactions = transactions;
      if (dateRange) {
        filteredTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= dateRange.start && txDate <= dateRange.end;
        });
      }

      // Transform data using template
      const exportTemplate = templates[template] || templates.standard;
      const data = applyTemplate(filteredTransactions, exportTemplate);

      // Prepare values for Google Sheets
      const values = [
        Object.keys(data[0]), // Headers
        ...data.map(row => Object.values(row))
      ];

      // Determine range
      const range = append
        ? `${sheetName}!A${await this.getNextRow(sheetName)}`
        : `${sheetName}!A1`;

      // Update spreadsheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      Logger.info('Successfully exported to Google Sheets', {
        rows: data.length,
        sheet: sheetName
      });
    } catch (error) {
      throw new ExternalIntegrationError(
        'Failed to export to Google Sheets',
        'GOOGLE_SHEETS_ERROR',
        error
      );
    }
  }

  private async getNextRow(sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range: `${sheetName}!A:A`
    });

    return (response.data.values?.length || 0) + 1;
  }
}

// Dropbox Integration
export class DropboxExporter {
  private dbx: Dropbox;

  constructor(private config: DropboxConfig) {
    this.dbx = new Dropbox({
      clientId: config.appKey,
      clientSecret: config.appSecret
    });
  }

  async authorize(token?: string): Promise<string> {
    if (token) {
      this.dbx.setAccessToken(token);
      return token;
    }

    const authUrl = this.dbx.getAuthenticationUrl(
      this.config.redirectUri,
      null,
      'code',
      'offline',
      null,
      'none',
      false
    );

    return authUrl;
  }

  async exportTransactions(
    transactions: ChaseTransaction[],
    options: {
      path?: string;
      template?: string;
      format?: 'csv' | 'xlsx';
    } = {}
  ): Promise<string> {
    try {
      const {
        path = '/Expenses',
        template = 'standard',
        format = 'csv'
      } = options;

      // Transform data using template
      const exportTemplate = templates[template] || templates.standard;
      const data = applyTemplate(transactions, exportTemplate);

      // Generate file content
      let content: Buffer;
      let mimeType: string;
      let extension: string;

      if (format === 'csv') {
        content = Buffer.from(this.generateCSV(data));
        mimeType = 'text/csv';
        extension = 'csv';
      } else {
        content = await this.generateXLSX(data);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
      }

      // Generate filename
      const filename = `expenses_${new Date().toISOString().split('T')[0]}.${extension}`;
      const fullPath = `${path}/${filename}`;

      // Upload to Dropbox
      const response = await this.dbx.filesUpload({
        path: fullPath,
        contents: content,
        mode: { '.tag': 'overwrite' },
        mute: true
      });

      // Create shared link
      const shareResponse = await this.dbx.sharingCreateSharedLink({
        path: response.result.path_display
      });

      Logger.info('Successfully exported to Dropbox', {
        path: fullPath,
        size: content.length,
        format
      });

      return shareResponse.result.url;
    } catch (error) {
      throw new ExternalIntegrationError(
        'Failed to export to Dropbox',
        'DROPBOX_ERROR',
        error
      );
    }
  }

  private generateCSV(data: Record<string, any>[]): string {
    const headers = Object.keys(data[0]);
    const rows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ];
    return rows.join('\n');
  }

  private async generateXLSX(data: Record<string, any>[]): Promise<Buffer> {
    // Implement XLSX generation using a library like xlsx
    // This is a placeholder
    return Buffer.from('');
  }
}

// Usage example:
/*
const sheetsExporter = new GoogleSheetsExporter({
  spreadsheetId: 'your-spreadsheet-id',
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/google/callback'
});

await sheetsExporter.exportTransactions(transactions, {
  sheetName: 'Q1 2024',
  template: 'taxReport',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-03-31')
  }
});

const dropboxExporter = new DropboxExporter({
  appKey: process.env.DROPBOX_APP_KEY!,
  appSecret: process.env.DROPBOX_APP_SECRET!,
  redirectUri: 'http://localhost:3000/auth/dropbox/callback'
});

const shareUrl = await dropboxExporter.exportTransactions(transactions, {
  path: '/Expenses/2024',
  template: 'expenseReport',
  format: 'xlsx'
});
*/ 