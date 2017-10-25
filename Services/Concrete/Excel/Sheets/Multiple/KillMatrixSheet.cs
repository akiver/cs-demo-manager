using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
	public class KillMatrixSheet : AbstractMultipleSheet
	{
		public KillMatrixSheet(IWorkbook workbook, List<Demo> demos)
		{
			Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
			Demos = demos;
			Sheet = workbook.CreateSheet("Kill matrix");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				// store players row and columns index
				Dictionary<long, int> playersRow = new Dictionary<long, int>();
				Dictionary<long, int> playersColumn = new Dictionary<long, int>();

				// first row containing victims name
				IRow firstRow = Sheet.CreateRow(0);
				SetCellValue(firstRow, 0, CellType.String, "Killer\\Victim");

				int columnCount = 1;
				int rowCount = 1;
				foreach (Demo demo in Demos)
				{
					// create rows and columns with only players name
					foreach (Player player in demo.Players)
					{
						if (!playersRow.ContainsKey(player.SteamId))
						{
							// add a column for this player in the first row
							SetCellValue(firstRow, columnCount, CellType.String, player.Name);
							playersRow.Add(player.SteamId, rowCount);
							// create a row for this player
							IRow row = Sheet.CreateRow(rowCount++);
							SetCellValue(row, 0, CellType.String, player.Name);
							playersColumn.Add(player.SteamId, columnCount++);
						}
					}

					// insert kills value
					foreach (Player player in demo.Players)
					{
						if (playersRow.ContainsKey(player.SteamId))
						{
							int rowIndex = playersRow[player.SteamId];
							foreach (Player pl in demo.Players)
							{
								if (playersColumn.ContainsKey(pl.SteamId))
								{
									int columnIndex = playersColumn[pl.SteamId];
									int killCount = demo.Kills.Count(e => e.KillerSteamId == player.SteamId && e.KilledSteamId == pl.SteamId);
									IRow row = Sheet.GetRow(rowIndex);
									SetCellValue(row, columnIndex, CellType.Numeric, killCount);
								}
							}
						}
					}

					// fill empty cells with 0
					for (int rowIndex = 0; rowIndex < rowCount; rowIndex++)
					{
						for (int columnIndex = 0; columnIndex < columnCount; columnIndex++)
						{
							IRow row = Sheet.GetRow(rowIndex);
							ICell cell = row.GetCell(columnIndex);
							if (cell == null) SetCellValue(row, columnIndex, CellType.Numeric, 0);
						}
					}
				}
			});
		}
	}
}
