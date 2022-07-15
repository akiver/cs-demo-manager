using System.Collections.Generic;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using NPOI.SS.UserModel;
using Services.Models.Excel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class WeaponsSheet : AbstractMultipleSheet
    {
        private readonly Dictionary<Weapon, WeaponsData> _data = new Dictionary<Weapon, WeaponsData>();
        private readonly long _focusSteamId = 0;

        public WeaponsSheet(IWorkbook workbook, long steamId = 0)
        {
            _focusSteamId = steamId;
            Headers = new Dictionary<string, CellType>()
            {
                { "Name", CellType.String },
                { "Kills", CellType.Numeric },
                { "Damage health", CellType.Numeric },
                { "Damage armor", CellType.Numeric },
                { "Shots", CellType.Numeric },
                { "Hits", CellType.Numeric },
                { "Accuracy %", CellType.Numeric },
            };
            Sheet = workbook.CreateSheet("Weapons");
        }

        public override void AddDemo(Demo demo)
        {
            foreach (WeaponFireEvent weaponFire in demo.WeaponFired)
            {
                if (_focusSteamId != 0 && weaponFire.ShooterSteamId != _focusSteamId)
                {
                    continue;
                }

                if (weaponFire.Weapon.Element != EquipmentElement.Unknown)
                {
                    if (!_data.ContainsKey(weaponFire.Weapon))
                    {
                        _data.Add(weaponFire.Weapon, new WeaponsData());
                    }

                    _data[weaponFire.Weapon].Shots++;
                }
            }

            foreach (PlayerHurtedEvent hurtEvent in demo.PlayersHurted)
            {
                if (_focusSteamId != 0 && hurtEvent.AttackerSteamId != _focusSteamId)
                {
                    continue;
                }

                if (hurtEvent.Weapon.Element != EquipmentElement.Unknown)
                {
                    if (!_data.ContainsKey(hurtEvent.Weapon))
                    {
                        _data.Add(hurtEvent.Weapon, new WeaponsData());
                    }

                    _data[hurtEvent.Weapon].Hits++;
                    _data[hurtEvent.Weapon].TotalDamageArmor += hurtEvent.ArmorDamage;
                    _data[hurtEvent.Weapon].TotalDamageHealth += hurtEvent.HealthDamage;
                }
            }

            foreach (KillEvent killEvent in demo.Kills)
            {
                if (_focusSteamId != 0 && killEvent.KillerSteamId != _focusSteamId)
                {
                    continue;
                }

                if (killEvent.Weapon.Element != EquipmentElement.Unknown)
                {
                    if (!_data.ContainsKey(killEvent.Weapon))
                    {
                        _data.Add(killEvent.Weapon, new WeaponsData());
                    }

                    _data[killEvent.Weapon].KillCount++;
                }
            }
        }

        protected override void GenerateContent()
        {
            int rowCount = 1;
            foreach (KeyValuePair<Weapon, WeaponsData> weaponData in _data)
            {
                IRow row = Sheet.CreateRow(rowCount++);
                int columnNumber = 0;
                SetCellValue(row, columnNumber++, CellType.String, weaponData.Key.Name);
                SetCellValue(row, columnNumber++, CellType.Numeric, weaponData.Value.KillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, weaponData.Value.TotalDamageHealth);
                SetCellValue(row, columnNumber++, CellType.Numeric, weaponData.Value.TotalDamageArmor);
                SetCellValue(row, columnNumber++, CellType.Numeric, weaponData.Value.Shots);
                SetCellValue(row, columnNumber++, CellType.Numeric, weaponData.Value.Hits);
                SetCellValue(row, columnNumber, CellType.Numeric, weaponData.Value.Accurary);
            }
        }
    }
}
