import type { CellValue } from './cell-value';
import type { Column } from './column';
import type { Workbook } from './workbook';

export abstract class Sheet<RowType> {
  private workbook: Workbook;
  protected abstract getName(): string;
  protected abstract getColumns(): Column<RowType>[];
  protected abstract generate(): void | Promise<void>;

  public constructor(workbook: Workbook) {
    this.workbook = workbook;
    this.workbook.addSheet(this.getName());
    const columnNames = this.getColumns().map((column) => column.name);
    if (columnNames.length > 0) {
      this.workbook.addRowToSheet(this.getName(), columnNames);
    }
  }

  protected writeRow(row: RowType) {
    const cells: CellValue[] = [];
    for (const column of this.getColumns()) {
      cells.push(column.cellFormatter(row));
    }

    this.workbook.addRowToSheet(this.getName(), cells);
  }

  protected writeCells(cells: CellValue[]) {
    this.workbook.addRowToSheet(this.getName(), cells);
  }
}
