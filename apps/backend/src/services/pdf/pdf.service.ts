import { Stream } from "node:stream";
import { Injectable, Logger } from "@nestjs/common";
import PDFDocument from "pdfkit";

interface ReportCustomization {
  title: string;
  logoPath?: string;
  groupBy?: string;
  sortBy?: string;
  includeHeaders?: boolean;
  includeSummary?: boolean;
}

@Injectable()
export class PDFService {
  private readonly logger = new Logger(PDFService.name);

  async generateReport(data: any[], customization: ReportCustomization): Promise<Stream> {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = doc.pipe(new Stream.PassThrough());

      // Add logo if provided
      if (customization.logoPath) {
        doc.image(customization.logoPath, 50, 45, { width: 50 }).moveDown();
      }

      // Add title
      doc.fontSize(20).text(customization.title, { align: "center" }).moveDown();

      // Group data if requested
      if (customization.groupBy) {
        const groupedData = this.groupData(data, customization.groupBy);
        for (const [group, items] of Object.entries(groupedData)) {
          doc.fontSize(16).text(group).moveDown(0.5);

          await this.addTable(doc, items, customization);
          doc.moveDown();

          if (customization.includeSummary) {
            await this.addGroupSummary(doc, items);
          }
          doc.moveDown();
        }
      } else {
        await this.addTable(doc, data, customization);
      }

      if (customization.includeSummary && !customization.groupBy) {
        await this.addSummary(doc, data);
      }

      doc.end();
      return stream;
    } catch (error: any) {
      this.logger.error(`Error generating PDF report: ${error?.message || "Unknown error"}`);
      throw error;
    }
  }

  private groupData(data: any[], groupBy: string): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const key = item[groupBy]?.toString() || "Ungrouped";
      return {
        ...groups,
        [key]: [...(groups[key] || []), item],
      };
    }, {});
  }

  private async addTable(
    doc: PDFKit.PDFDocument,
    data: any[],
    customization: ReportCustomization,
  ): Promise<void> {
    if (!data.length) return;

    const columns = Object.keys(data[0]);
    const columnWidth = (doc.page.width - 100) / columns.length;

    if (customization.includeHeaders) {
      columns.forEach((header, i) => {
        doc.text(header.charAt(0).toUpperCase() + header.slice(1), 50 + i * columnWidth, doc.y, {
          width: columnWidth,
          align: "left",
        });
      });
      doc.moveDown();
    }

    data.forEach((row) => {
      columns.forEach((col, i) => {
        doc.text(row[col]?.toString() || "", 50 + i * columnWidth, doc.y, {
          width: columnWidth,
          align: "left",
        });
      });
      doc.moveDown(0.5);
    });
  }

  private async addGroupSummary(doc: PDFKit.PDFDocument, data: any[]): Promise<void> {
    if (!data.length) return;

    const numericColumns = Object.keys(data[0]).filter((key) => typeof data[0][key] === "number");

    if (numericColumns.length) {
      doc.fontSize(12).text("Summary:", { underline: true }).moveDown(0.5);

      numericColumns.forEach((col) => {
        const sum = data.reduce((acc, curr) => acc + (curr[col] || 0), 0);
        doc.text(`${col} Total: ${sum.toFixed(2)}`).moveDown(0.5);
      });
    }
  }

  private async addSummary(doc: PDFKit.PDFDocument, data: any[]): Promise<void> {
    if (!data.length) return;

    doc.moveDown().fontSize(14).text("Report Summary", { underline: true }).moveDown();

    doc.fontSize(12).text(`Total Records: ${data.length}`).moveDown(0.5);

    await this.addGroupSummary(doc, data);
  }
}
