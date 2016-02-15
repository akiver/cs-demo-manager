using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Excel;
using DemoInfo;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel.Sheets.Multiple
{
	public class WeaponsSheet : AbstractMultipleSheet
	{
		public WeaponsSheet(IWorkbook workbook, List<Demo> demos)
		{
			Headers = new Dictionary<string, CellType>()
			{
				{"Name", CellType.String},
				{"Kills", CellType.Numeric},
				{"Damage health", CellType.Numeric},
				{"Damage armor", CellType.Numeric},
				{"Shots", CellType.Numeric},
				{"Hits", CellType.Numeric},
				{"Accuracy %", CellType.Numeric}
			};
			Demos = demos;
			Sheet = workbook.CreateSheet("Weapons");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				Dictionary<Weapon, WeaponsData> data = new Dictionary<Weapon, WeaponsData>();
				
				foreach (Demo demo in Demos)
				{
					foreach (WeaponFire weaponFire in demo.WeaponFired)
					{
						if (Properties.Settings.Default.SelectedStatsAccountSteamID != 0
						    && weaponFire.ShooterSteamId != Properties.Settings.Default.SelectedStatsAccountSteamID) continue;

						if (weaponFire.Weapon.Element != EquipmentElement.Unknown)
						{
							if (!data.ContainsKey(weaponFire.Weapon)) data.Add(weaponFire.Weapon, new WeaponsData());
							data[weaponFire.Weapon].Shots++;
						}
					}

					foreach (PlayerHurtedEvent hurtedEvent in demo.PlayersHurted)
					{
						if (Properties.Settings.Default.SelectedStatsAccountSteamID != 0
							&& hurtedEvent.AttackerSteamId != Properties.Settings.Default.SelectedStatsAccountSteamID) continue;

						if (hurtedEvent.Weapon.Element != EquipmentElement.Unknown)
						{
							if (!data.ContainsKey(hurtedEvent.Weapon)) data.Add(hurtedEvent.Weapon, new WeaponsData());
							data[hurtedEvent.Weapon].Hits++;
							data[hurtedEvent.Weapon].TotalDamageArmor += hurtedEvent.ArmorDamage;
							data[hurtedEvent.Weapon].TotalDamageHealth += hurtedEvent.HealthDamage;
						}
					}

					foreach (KillEvent killEvent in demo.Kills)
					{
						if (Properties.Settings.Default.SelectedStatsAccountSteamID != 0
							&& killEvent.KillerSteamId != Properties.Settings.Default.SelectedStatsAccountSteamID) continue;

						if (killEvent.Weapon.Element != EquipmentElement.Unknown)
						{
							if (!data.ContainsKey(killEvent.Weapon)) data.Add(killEvent.Weapon, new WeaponsData());
							data[killEvent.Weapon].KillCount++;
						}
					}
				}

				int rowCount = 1;
				foreach (KeyValuePair<Weapon, WeaponsData> keyValuePair in data)
				{
					IRow row = Sheet.CreateRow(rowCount++);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, keyValuePair.Key.Name);
					SetCellValue(row, columnNumber++, CellType.Numeric, keyValuePair.Value.KillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, keyValuePair.Value.TotalDamageHealth);
					SetCellValue(row, columnNumber++, CellType.Numeric, keyValuePair.Value.TotalDamageArmor);
					SetCellValue(row, columnNumber++, CellType.Numeric, keyValuePair.Value.Shots);
					SetCellValue(row, columnNumber++, CellType.Numeric, keyValuePair.Value.Hits);
					SetCellValue(row, columnNumber, CellType.Numeric, keyValuePair.Value.Accurary);
				}
			});
		}
	}
}
