using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets
{
	public class PlayersSheet : AbstractSheet
	{
		private readonly ISheet _sheet;

		private readonly Demo _demo;

		public Dictionary<string, CellType> Headers => new Dictionary<string, CellType>(){
			{ "Name", CellType.String },
			{ "SteamID", CellType.String },
			{ "Kills", CellType.Numeric },
			{ "Assists", CellType.Numeric },
			{ "Deaths", CellType.Numeric },
			{ "K/D", CellType.Numeric },
			{ "HS", CellType.Numeric },
			{ "Team kill", CellType.Numeric },
			{ "Entry kill", CellType.Numeric },
			{ "Bomb planted", CellType.Numeric },
			{ "Bomb defused", CellType.Numeric },
			{ "MVP", CellType.Numeric },
			{ "Score", CellType.Numeric },
			{ "5K", CellType.Numeric },
			{ "4K", CellType.Numeric },
			{ "3K", CellType.Numeric },
			{ "2K", CellType.Numeric },
			{ "1K", CellType.Numeric },
			{ "1v1", CellType.Numeric },
			{ "1v2", CellType.Numeric },
			{ "1v3", CellType.Numeric },
			{ "1v4", CellType.Numeric },
			{ "1v5", CellType.Numeric }
		};

		public PlayersSheet(IWorkbook workbook, Demo demo)
		{
			_demo = demo;
			_sheet = workbook.CreateSheet("Players");
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

				foreach (PlayerExtended player in _demo.Players)
				{
					IRow row = _sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, player.Name);
					SetCellValue(row, columnNumber++, CellType.String, player.SteamId.ToString());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.KillsCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.AssistCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.DeathCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, (double)player.KillDeathRatio);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.HeadshotCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.TeamKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKills.Count());
					SetCellValue(row, columnNumber++, CellType.Numeric, player.BombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.BombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.RoundMvpCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Score);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.ThreekillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.TwokillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.OnekillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V1Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V2Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V3Count);
					SetCellValue(row, columnNumber++, CellType.Numeric, player.Clutch1V4Count);
					SetCellValue(row, columnNumber, CellType.Numeric, player.Clutch1V5Count);

					rowNumber++;
				}
			});
		}
	}
}