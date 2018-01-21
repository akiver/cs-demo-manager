using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
	public class RoundsSheet : AbstractSingleSheet
	{
		public RoundsSheet(IWorkbook workbook, Demo demo)
		{
			Headers = new Dictionary<string, CellType>(){
				{ "Number", CellType.Numeric },
				{ "Tick", CellType.Numeric},
				{ "Duration (s)", CellType.Numeric},
				{ "Winner Clan Name", CellType.String },
				{ "Winner", CellType.String },
				{ "End reason", CellType.String },
				{ "Type", CellType.String },
				{ "Side", CellType.String },
				{ "Team", CellType.String },
				{ "Kills", CellType.Numeric },
				{ "1K", CellType.Numeric },
				{ "2K", CellType.Numeric },
				{ "3K", CellType.Numeric },
				{ "4K", CellType.Numeric },
				{ "5K", CellType.Numeric },
				{ "Trade kill", CellType.Numeric },
				{ "Jump kills", CellType.Numeric },
				{ "ADP", CellType.Numeric },
				{ "TDH", CellType.Numeric },
				{ "TDA", CellType.Numeric },
				{ "Bomb Exploded", CellType.Numeric },
				{ "Bomb planted", CellType.Numeric },
				{ "Bomb defused", CellType.Numeric },
				{ "Start money team 1", CellType.Numeric },
				{ "Start money team 2", CellType.Numeric },
				{ "Equipement value team 1", CellType.Numeric },
				{ "Equipement value team 2", CellType.Numeric },
				{ "Flashbang", CellType.Numeric },
				{ "Smoke", CellType.Numeric },
				{ "HE", CellType.Numeric },
				{ "Decoy", CellType.Numeric },
				{ "Molotov", CellType.Numeric },
				{ "Incendiary", CellType.Numeric }
			};
			Demo = demo;
			Sheet = workbook.CreateSheet("Rounds");
		}

		public override async Task GenerateContent()
		{
			var rowNumber = 1;

			await Task.Factory.StartNew(() =>
			{
				// TODO fix it
				RoundService roundService = new RoundService();
				foreach (Round round in Demo.Rounds)
				{
					//if (Properties.Settings.Default.SelectedPlayerSteamId != 0)
					//{
					//	await roundService.MapRoundValuesToSelectedPlayer(Demo, round, Properties.Settings.Default.SelectedPlayerSteamId);
					//}

					IRow row = Sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Number);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Tick);
					SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round(round.Duration, 2));
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerName);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerSide.AsString());
					SetCellValue(row, columnNumber++, CellType.String, round.EndReason.AsString());
					SetCellValue(row, columnNumber++, CellType.String, round.Type.AsString());
					SetCellValue(row, columnNumber++, CellType.String, round.SideTrouble.AsString());
					SetCellValue(row, columnNumber++, CellType.String, round.TeamTroubleName != string.Empty ? round.TeamTroubleName : string.Empty);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.KillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.OneKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.TwoKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.ThreeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.TradeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.JumpKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.AverageHealthDamagePerPlayer);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.DamageHealthCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.DamageArmorCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.BombExplodedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.BombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.BombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.StartMoneyTeamCt);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.StartMoneyTeamT);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.EquipementValueTeamCt);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.EquipementValueTeamT);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.FlashbangThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.SmokeThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.HeGrenadeThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.DecoyThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.MolotovThrownCount);
					SetCellValue(row, columnNumber, CellType.Numeric, round.IncendiaryThrownCount);

					rowNumber++;
				}
			});
		}
	}
}
