declare module "xlsx" {
  interface WorkBook {
    Sheets: { [sheet: string]: WorkSheet };
    SheetNames: string[];
  }

  interface WorkSheet {
    [cell: string]: CellObject;
  }

  interface CellObject {
    v: string | number | boolean | Date;
    t: "s" | "n" | "b" | "d";
    w?: string;
  }

  interface XLSXUtils {
    aoa_to_sheet(data: any[][]): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(workbook: WorkBook, worksheet: WorkSheet, name: string): void;
    write(workbook: WorkBook, options: { type: string; bookType: string }): any;
  }

  const utils: XLSXUtils;
  export { utils };
}
