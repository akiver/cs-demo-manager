using System;
using System.Threading.Tasks;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public abstract class AbstractSheet
	{
		public abstract Task Generate();

		public void SetCellValue(IRow row, int index, CellType cellType, dynamic value)
		{
			if (value == null) value = string.Empty;
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