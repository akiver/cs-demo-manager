using System;
using System.Collections.Generic;
using System.Linq;

namespace Services.Concrete.Excel.Sheets
{
    internal abstract class Sheet
    {
        private readonly Workbook _workbook;
        protected abstract string GetName();
        protected abstract string[] GetColumnNames();
        public abstract void Generate();

        protected Sheet(Workbook workbook)
        {
            _workbook = workbook;
            _workbook.AddSheet(GetName());
            if (GetColumnNames().Length > 0)
            {
                _workbook.AddRowToSheet(GetName(), GetColumnNames().ToList<object>());
            }
        }

        protected void WriteRow(List<object> cells)
        {
            if (GetColumnNames().Length > 0 && cells.Count != GetColumnNames().Length)
            {
                throw new Exception($@"Expected {GetColumnNames().Length} cells, got {cells.Count}");
            }

            _workbook.AddRowToSheet(GetName(), cells);
        }
    }
}
