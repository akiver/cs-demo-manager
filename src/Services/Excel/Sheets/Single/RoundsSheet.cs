using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Single
{
	public class RoundsSheet : AbstractSingleSheet
	{
		public RoundsSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Number", CellType.Numeric },
				{ "Tick", CellType.Numeric},
				{ "Winner Clan Name", CellType.String },
				{ "Winner", CellType.String },
				{ "Type", CellType.String },
				{ "Side", CellType.String },
				{ "Team", CellType.String },
				{ "Kills", CellType.Numeric },
				{ "1K", CellType.Numeric },
				{ "2K", CellType.Numeric },
				{ "3K", CellType.Numeric },
				{ "4K", CellType.Numeric },
				{ "5K", CellType.Numeric },
				{ "ADP", CellType.Numeric },
				{ "TDH", CellType.Numeric },
				{ "TDA", CellType.Numeric },
				{ "Bomb Exploded", CellType.Numeric },
				{ "Bomb planted", CellType.Numeric },
				{ "Bomb defused", CellType.Numeric },
				{ "Start money team 1", CellType.Numeric },
				{ "Start money team 2", CellType.Numeric },
				{ "Equipement value team 1", CellType.Numeric },
				{ "Equipement value team 2", CellType.Numeric }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Rounds");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				var rowNumber = 1;

				foreach (Round round in Demo.Rounds)
				{
					IRow row = Sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Number);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Tick);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerName);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerSideAsString);
					SetCellValue(row, columnNumber++, CellType.String, round.RoundTypeAsString);
					SetCellValue(row, columnNumber++, CellType.String, round.SideTroubleAsString);
					if (round.TeamTroubleName != string.Empty)
					{
						SetCellValue(row, columnNumber++, CellType.String, round.TeamTroubleName);
					}
					else
					{
						SetCellValue(row, columnNumber++, CellType.String, string.Empty);
					}
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Kills.Count());
					SetCellValue(row, columnNumber++, CellType.Numeric, round.OneKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.TwoKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.ThreeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.AverageDamageByPlayerCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.TotalDamageHealthCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.TotalDamageArmorCount);
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