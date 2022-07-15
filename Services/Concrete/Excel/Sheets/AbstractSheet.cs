using System;
using System.Collections.Generic;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets
{
    public abstract class AbstractSheet
    {
        protected ISheet Sheet;

        protected Dictionary<string, CellType> Headers;

        protected abstract void GenerateContent();

        protected void GenerateHeaders()
        {
            IRow row = Sheet.CreateRow(0);
            int i = 0;
            foreach (KeyValuePair<string, CellType> pair in Headers)
            {
                ICell cell = row.CreateCell(i);
                cell.SetCellType(pair.Value);
                cell.SetCellValue(pair.Key);
                i++;
            };
        }

        public void Generate()
        {
            GenerateHeaders();
            GenerateContent();
        }

        public void SetCellValue(IRow row, int index, CellType cellType, dynamic value)
        {
            if (value == null)
            {
                value = string.Empty;
            }

            if (value is string)
            {
                value = Convert.ChangeType(value, TypeCode.String);
            }
            else
            {
                value = Convert.ChangeType(value, TypeCode.Double);
            }

            ICell cell = row.CreateCell(index);
            cell.SetCellType(cellType);
            cell.SetCellValue(value);
        }
    }
}
