using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class RoundsSheet : AbstractSheet
	{
		private readonly ISheet _sheet;

		private readonly Demo _demo;

		public Dictionary<string, CellType> Headers => new Dictionary<string, CellType>(){
			{ "Number", CellType.Numeric },
			{ "Tick", CellType.Numeric},
			{ "Winner Clan Name", CellType.String },
			{ "Winner", CellType.String },
			{ "Kills", CellType.Numeric },
			{ "1K", CellType.Numeric },
			{ "2K", CellType.Numeric },
			{ "3K", CellType.Numeric },
			{ "4K", CellType.Numeric },
			{ "5K", CellType.Numeric },
			{ "Bomb Exploded", CellType.Numeric },
			{ "Bomb planted", CellType.Numeric },
			{ "Bomb defused", CellType.Numeric },
			{ "Start money team 1", CellType.Numeric },
			{ "Start money team 2", CellType.Numeric },
			{ "Equipement value team 1", CellType.Numeric },
			{ "Equipement value team 2", CellType.Numeric }
		};

		public RoundsSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("Rounds");
		}

		public override async Task Generate()
		{
			await GenerateHeaders();
			await GenerateContent();
		}

		private async Task GenerateHeaders()
		{
			await Task.Factory.StartNew(() =>
			{
				IRow row = _sheet.CreateRow(0);
				int i = 0;
				foreach (KeyValuePair<string, CellType> pair in Headers)
				{
					ICell cell = row.CreateCell(i);
					cell.SetCellType(pair.Value);
					cell.SetCellValue(pair.Key);
					i++;
				}
			});
		}

		private async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				var rowNumber = 1;

				foreach (Round round in _demo.Rounds)
				{
					IRow row = _sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Number);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Tick);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerClanName);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerAsString);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Kills.Count());
					SetCellValue(row, columnNumber++, CellType.Numeric, round.OneKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.TwoKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.ThreeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.BombExplodedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.BombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.BombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.StartMoneyTeam1);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.StartMoneyTeam2);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.EquipementValueTeam1);
					SetCellValue(row, columnNumber, CellType.Numeric, round.EquipementValueTeam2);

					rowNumber++;
				}
			});
		}
	}
}