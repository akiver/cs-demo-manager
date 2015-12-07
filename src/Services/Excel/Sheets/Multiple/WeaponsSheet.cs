using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
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
				{"Damage armor", CellType.Numeric}
			};
			Demos = demos;
			Sheet = workbook.CreateSheet("Weapons");
		}

		public override async Task GenerateContent()
		{
			await Task.Factory.StartNew(() =>
			{
				List<Weapon> weapons = new List<Weapon>();
				foreach (Demo demo in Demos)
				{
					foreach (PlayerHurtedEvent hurtedEvent in demo.Rounds.SelectMany(round => round.PlayersHurted)
					.Where(hurtedEvent => hurtedEvent.Weapon.Name != "World" && hurtedEvent.Weapon.Name != "Unknown 2 stronk"))
					{
						if (weapons.Contains(hurtedEvent.Weapon))
						{
							Weapon weapon = weapons.First(w => w.Equals(hurtedEvent.Weapon));
							weapon.TotalDamageArmor += hurtedEvent.ArmorDamage;
							weapon.TotalDamageHealth += hurtedEvent.HealthDamage;
						}
						else
						{
							Weapon weapon = new Weapon
							{
								Name = hurtedEvent.Weapon.Name,
								TotalDamageArmor = hurtedEvent.ArmorDamage,
								TotalDamageHealth = hurtedEvent.HealthDamage
							};
							weapons.Add(weapon);
						}
					}
					foreach (KillEvent kill in demo.Kills.Where(kill => kill.Weapon.Name != "World" && kill.Weapon.Name != "Unknown 2 stronk"))
					{
						if (weapons.Contains(kill.Weapon))
						{
							Weapon weapon = weapons.First(w => w.Equals(kill.Weapon));
							weapon.KillCount++;
						}
						else
						{
							Weapon weapon = new Weapon
							{
								Name = kill.Weapon.Name,
								KillCount = 1
							};
							weapons.Add(weapon);
						}
					}
				}

				int rowCount = 1;
				foreach (Weapon weapon in weapons)
				{
					IRow row = Sheet.CreateRow(rowCount++);
					int columnNumber = 0;
					SetCellValue(row, columnNumber++, CellType.String, weapon.Name);
					SetCellValue(row, columnNumber++, CellType.Numeric, weapon.KillCount);
					SetCellValue(row, columnNumber++, CellType.Numeric, weapon.TotalDamageHealth);
					SetCellValue(row, columnNumber, CellType.Numeric, weapon.TotalDamageArmor);
				}
			});
		}
	}
}
