'use client';

import { jsPDF } from 'jspdf';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';

interface ReceiptStyle {
  font: string;
  fontSize: number;
  lineHeight: number;
  padding: number;
  width: number;
  headerSpacing: number;
  itemSpacing: number;
  borderStyle: {
    top: string;
    bottom: string;
    pattern: string;
  };
}

export class ReceiptStyler {
  private readonly DEFAULT_STYLE: ReceiptStyle = {
    font: 'Courier',
    fontSize: 10,
    lineHeight: 12,
    padding: 20,
    width: 170,
    headerSpacing: 5,
    itemSpacing: 3,
    borderStyle: {
      top: '= = = = = = = = = = = = = = = = = =',
      bottom: '- - - - - - - - - - - - - - - - -',
      pattern: '. . . . . . . . . . . . . . . . .'
    }
  };

  addStyledReceipt(
    doc: jsPDF,
    data: {
      merchant: string;
      date: Date;
      items: Array<{ description: string; amount: number }>;
      tax?: number;
      total: number;
      receiptNumber?: string;
    },
    startY: number,
    style: Partial<ReceiptStyle> = {}
  ): number {
    const receiptStyle = { ...this.DEFAULT_STYLE, ...style };
    let currentY = startY + receiptStyle.padding;

    // Add receipt border
    this.addReceiptBorder(doc, startY, receiptStyle);

    // Add header
    currentY = this.addHeader(doc, data, currentY, receiptStyle);

    // Add items
    currentY = this.addItems(doc, data.items, currentY, receiptStyle);

    // Add totals
    currentY = this.addTotals(doc, data, currentY, receiptStyle);

    // Add footer
    currentY = this.addFooter(doc, data, currentY, receiptStyle);

    // Add bottom border
    this.addBottomBorder(doc, currentY + receiptStyle.padding, receiptStyle);

    return currentY + (receiptStyle.padding * 2);
  }

  private addReceiptBorder(
    doc: jsPDF,
    startY: number,
    style: ReceiptStyle
  ): void {
    // Add decorative top border
    doc.setFont(style.font);
    doc.setFontSize(style.fontSize);
    doc.text(style.borderStyle.top, style.padding, startY);

    // Add side borders
    const height = doc.internal.pageSize.height - startY - (style.padding * 2);
    const pattern = style.borderStyle.pattern.split('');
    const patternHeight = style.lineHeight;
    
    for (let y = startY; y < height; y += patternHeight) {
      doc.text('|', style.padding - 5, y);
      doc.text('|', style.padding + style.width + 5, y);
    }
  }

  private addHeader(
    doc: jsPDF,
    data: { merchant: string; date: Date; receiptNumber?: string },
    startY: number,
    style: ReceiptStyle
  ): number {
    let currentY = startY;

    // Merchant name
    doc.setFontSize(style.fontSize + 2);
    doc.text(data.merchant.toUpperCase(), style.padding, currentY, {
      align: 'center',
      maxWidth: style.width
    });
    currentY += style.lineHeight * 1.5;

    // Date and receipt number
    doc.setFontSize(style.fontSize);
    doc.text(formatDateDisplay(data.date), style.padding, currentY);
    if (data.receiptNumber) {
      doc.text(`#${data.receiptNumber}`, style.padding + style.width, currentY, {
        align: 'right'
      });
    }
    currentY += style.lineHeight * 2;

    // Separator
    doc.text(style.borderStyle.pattern, style.padding, currentY);
    currentY += style.lineHeight;

    return currentY;
  }

  private addItems(
    doc: jsPDF,
    items: Array<{ description: string; amount: number }>,
    startY: number,
    style: ReceiptStyle
  ): number {
    let currentY = startY;

    // Column headers
    doc.text('Item', style.padding, currentY);
    doc.text('Amount', style.padding + style.width, currentY, { align: 'right' });
    currentY += style.lineHeight;

    // Items
    items.forEach(item => {
      // Description (with word wrap)
      const lines = doc.splitTextToSize(item.description, style.width - 50);
      lines.forEach(line => {
        doc.text(line, style.padding, currentY);
        currentY += style.lineHeight;
      });

      // Amount (aligned right)
      doc.text(
        formatCurrency(item.amount),
        style.padding + style.width,
        currentY - style.lineHeight,
        { align: 'right' }
      );

      currentY += style.itemSpacing;
    });

    // Separator
    doc.text(style.borderStyle.pattern, style.padding, currentY);
    currentY += style.lineHeight;

    return currentY;
  }

  private addTotals(
    doc: jsPDF,
    data: { tax?: number; total: number },
    startY: number,
    style: ReceiptStyle
  ): number {
    let currentY = startY;

    // Subtotal
    if (data.tax) {
      const subtotal = data.total - data.tax;
      doc.text('Subtotal:', style.padding, currentY);
      doc.text(
        formatCurrency(subtotal),
        style.padding + style.width,
        currentY,
        { align: 'right' }
      );
      currentY += style.lineHeight;

      // Tax
      doc.text('Tax:', style.padding, currentY);
      doc.text(
        formatCurrency(data.tax),
        style.padding + style.width,
        currentY,
        { align: 'right' }
      );
      currentY += style.lineHeight;
    }

    // Total
    doc.setFontSize(style.fontSize + 1);
    doc.text('TOTAL:', style.padding, currentY);
    doc.text(
      formatCurrency(data.total),
      style.padding + style.width,
      currentY,
      { align: 'right' }
    );
    currentY += style.lineHeight * 1.5;

    return currentY;
  }

  private addFooter(
    doc: jsPDF,
    data: { merchant: string },
    startY: number,
    style: ReceiptStyle
  ): number {
    let currentY = startY;

    // Thank you message
    doc.setFontSize(style.fontSize);
    doc.text(
      `Thank you for your business!`,
      style.padding + (style.width / 2),
      currentY,
      { align: 'center' }
    );
    currentY += style.lineHeight;

    return currentY;
  }

  private addBottomBorder(
    doc: jsPDF,
    startY: number,
    style: ReceiptStyle
  ): void {
    doc.text(style.borderStyle.bottom, style.padding, startY);
  }
}

export const receiptStyler = new ReceiptStyler(); 