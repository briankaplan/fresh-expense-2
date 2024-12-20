'use client';

import { ChaseTransaction } from '@/types';
import { formatDateDisplay } from '@/utils/dates';
import { formatCurrency } from '@/utils/currency';

interface TemplateField {
  key: string;
  label: string;
  getValue: (tx: ChaseTransaction) => string | number;
  format?: (value: any) => string;
  required?: boolean;
  description?: string;
}

interface ExportTemplate {
  name: string;
  description?: string;
  fields: TemplateField[];
  preProcess?: (tx: ChaseTransaction) => ChaseTransaction;
  postProcess?: (data: Record<string, any>[]) => Record<string, any>[];
  validate?: (tx: ChaseTransaction) => boolean;
}

class TemplateBuilder {
  private template: ExportTemplate;

  constructor(name: string) {
    this.template = {
      name,
      fields: []
    };
  }

  description(desc: string): TemplateBuilder {
    this.template.description = desc;
    return this;
  }

  addField(field: TemplateField): TemplateBuilder {
    this.template.fields.push(field);
    return this;
  }

  addDateField(key: string, options: {
    label?: string;
    source?: keyof ChaseTransaction;
    format?: string;
    required?: boolean;
  } = {}): TemplateBuilder {
    const {
      label = key,
      source = 'date',
      format = 'yyyy-MM-dd',
      required = true
    } = options;

    return this.addField({
      key,
      label,
      required,
      getValue: (tx) => tx[source] as string,
      format: (value) => formatDateDisplay(new Date(value), format),
      description: `Date field in ${format} format`
    });
  }

  addAmountField(key: string, options: {
    label?: string;
    source?: keyof ChaseTransaction;
    format?: 'currency' | 'number';
    required?: boolean;
  } = {}): TemplateBuilder {
    const {
      label = key,
      source = 'amount',
      format = 'currency',
      required = true
    } = options;

    return this.addField({
      key,
      label,
      required,
      getValue: (tx) => tx[source] as number,
      format: (value) => format === 'currency' ? formatCurrency(value) : value.toString(),
      description: `Amount field in ${format} format`
    });
  }

  addTextField(key: string, options: {
    label?: string;
    source?: keyof ChaseTransaction;
    required?: boolean;
    transform?: (value: string) => string;
  } = {}): TemplateBuilder {
    const {
      label = key,
      source = key as keyof ChaseTransaction,
      required = false,
      transform
    } = options;

    return this.addField({
      key,
      label,
      required,
      getValue: (tx) => tx[source] as string,
      format: transform,
      description: `Text field from ${source}`
    });
  }

  addCalculatedField(key: string, options: {
    label?: string;
    calculate: (tx: ChaseTransaction) => any;
    format?: (value: any) => string;
    description?: string;
  }): TemplateBuilder {
    const {
      label = key,
      calculate,
      format = String,
      description
    } = options;

    return this.addField({
      key,
      label,
      getValue: calculate,
      format,
      description
    });
  }

  addPreProcessor(fn: (tx: ChaseTransaction) => ChaseTransaction): TemplateBuilder {
    this.template.preProcess = fn;
    return this;
  }

  addPostProcessor(fn: (data: Record<string, any>[]) => Record<string, any>[]): TemplateBuilder {
    this.template.postProcess = fn;
    return this;
  }

  addValidator(fn: (tx: ChaseTransaction) => boolean): TemplateBuilder {
    this.template.validate = fn;
    return this;
  }

  build(): ExportTemplate {
    if (!this.template.fields.length) {
      throw new Error('Template must have at least one field');
    }
    return this.template;
  }
}

// Predefined templates
export const templates = {
  taxReport: new TemplateBuilder('Tax Report')
    .description('Export transactions for tax reporting')
    .addDateField('Date')
    .addTextField('Description', { required: true })
    .addAmountField('Amount', { required: true })
    .addTextField('Category', { required: true })
    .addTextField('Type', { required: true })
    .addCalculatedField('Tax Amount', {
      label: 'Tax Amount',
      calculate: (tx) => (tx.metadata?.taxAmount || 0),
      format: formatCurrency
    })
    .addCalculatedField('Deductible', {
      calculate: (tx) => tx.type === 'business' ? 'Yes' : 'No'
    })
    .addValidator(tx => tx.amount > 0 && Boolean(tx.category))
    .build(),

  expenseReport: new TemplateBuilder('Expense Report')
    .description('Detailed expense report with receipt information')
    .addDateField('Date')
    .addTextField('Merchant', { required: true })
    .addAmountField('Amount')
    .addTextField('Category')
    .addTextField('Receipt URL', { source: 'receiptUrl' })
    .addCalculatedField('Receipt Status', {
      calculate: (tx) => tx.hasReceipt ? 'Available' : 'Missing'
    })
    .addTextField('Notes')
    .addPreProcessor(tx => ({
      ...tx,
      notes: tx.notes?.replace(/[,\n\r]/g, ' ') // Clean notes for CSV
    }))
    .build()
};

// Usage example:
/*
const customTemplate = new TemplateBuilder('Custom Report')
  .description('My custom export format')
  .addDateField('TransactionDate', { format: 'MM/dd/yyyy' })
  .addTextField('Description', { required: true })
  .addAmountField('Amount', { format: 'number' })
  .addCalculatedField('Quarter', {
    calculate: (tx) => `Q${Math.floor(new Date(tx.date).getMonth() / 3) + 1}`,
    description: 'Fiscal quarter'
  })
  .build();

const data = applyTemplate(transactions, customTemplate);
*/

export function applyTemplate(
  transactions: ChaseTransaction[],
  template: ExportTemplate
): Record<string, any>[] {
  return transactions
    .filter(tx => !template.validate || template.validate(tx))
    .map(tx => {
      const processed = template.preProcess ? template.preProcess(tx) : tx;
      
      const row = template.fields.reduce((acc, field) => {
        const value = field.getValue(processed);
        acc[field.label] = field.format ? field.format(value) : value;
        return acc;
      }, {} as Record<string, any>);

      return row;
    })
    .filter(row => 
      template.fields
        .filter(f => f.required)
        .every(f => row[f.label] != null)
    );
} 