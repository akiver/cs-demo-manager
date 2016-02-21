using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;
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
			await Task.Factory.StartNew(() =>
			{
				var rowNumber = 1;

				foreach (Round round in Demo.Rounds)
				{
					IRow row = Sheet.CreateRow(rowNumber);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Number);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Tick);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.Duration);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerName);
					SetCellValue(row, columnNumber++, CellType.String, round.WinnerSideAsString);
					SetCellValue(row, columnNumber++, CellType.String, round.EndReasonAsString);
					SetCellValue(row, columnNumber++, CellType.String, round.RoundTypeAsString);
					SetCellValue(row, columnNumber++, CellType.String, round.SideTroubleAsString);
					SetCellValue(row, columnNumber++, CellType.String, round.TeamTroubleName != string.Empty ? round.TeamTroubleName : string.Empty);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.KillCount : round.SelectedPlayerKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.OneKillCount : round.SelectedPlayerOneKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.TwoKillCount : round.SelectedPlayerTwoKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.ThreeKillCount : round.SelectedPlayerThreeKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.FourKillCount: round.SelectedPlayerFourKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.FiveKillCount : round.SelectedPlayerFiveKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.JumpKillCount : round.SelectedPlayerJumpKillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.AverageDamage : round.SelectedPlayerAverageDamage);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.DamageHealthCount: round.SelectedPlayerDamageHealthCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.DamageArmorCount : round.SelectedPlayerDamageArmorCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.BombExplodedCount : round.SelectedPlayerBombExplodedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.BombPlantedCount : round.SelectedPlayerBombPlantedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.BombDefusedCount : round.SelectedPlayerBombDefusedCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.StartMoneyTeam1);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.StartMoneyTeam2);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.EquipementValueTeam1);
					SetCellValue(row, columnNumber++, CellType.Numeric, round.EquipementValueTeam2);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.FlashbangThrownCount : round.SelectedPlayerFlashbangThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.SmokeThrownCount : round.SelectedPlayerSmokeThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.HeGrenadeThrownCount : round.SelectedPlayerHeGrenadeThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.DecoyThrownCount : round.SelectedPlayerDecoyThrownCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.MolotovThrownCount : round.SelectedPlayerMolotovThrownCount);
					SetCellValue(row, columnNumber, CellType.Numeric, Properties.Settings.Default.SelectedPlayerSteamId == 0 ? round.IncendiaryThrownCount : round.SelectedPlayerIncendiaryThrownCount);

					rowNumber++;
				}
			});
		}
	}
}