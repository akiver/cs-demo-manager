using System.Collections.Generic;
using Core.Models;
using DemoInfo;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class WeaponsSheet: MultipleDemoSheet
    {
        private readonly Dictionary<string, WeaponSheetRow> _rowPerWeaponName = new Dictionary<string, WeaponSheetRow>();
        private readonly long _focusSteamId = 0;
        
        protected override string GetName()
        {
            return "Weapons";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Name",
                "Kills",
                "Damage health",
                "Damage armor",
                "Shots",
                "Hits",
                "Accuracy %",
            };
        }

        public WeaponsSheet(Workbook workbook, long steamId = 0): base(workbook)
        {
            _focusSteamId = steamId;
        }

        public override void AddDemo(Demo demo)
        {
            foreach (var weaponFire in demo.WeaponFired)
            {
                if (IsUnknownWeapon(weaponFire.Weapon))
                {
                    continue;
                }
                
                var shouldIgnoreFocusedPlayerShot = _focusSteamId != 0 && weaponFire.ShooterSteamId != _focusSteamId;
                if (shouldIgnoreFocusedPlayerShot)
                {
                    continue;
                }

                var weaponStats = GetWeaponStatsByName(weaponFire.Weapon.Name);
                weaponStats.Shots++;
            }

            foreach (var hurtEvent in demo.PlayersHurted)
            {
                if (IsUnknownWeapon(hurtEvent.Weapon))
                {
                    continue;
                }
                
                var shouldIgnoreFocusedPlayerHurtEvent = _focusSteamId != 0 && hurtEvent.AttackerSteamId != _focusSteamId;
                if (shouldIgnoreFocusedPlayerHurtEvent)
                {
                    continue;
                }

                var weaponStats = GetWeaponStatsByName(hurtEvent.Weapon.Name);
                weaponStats.Hits++;
                weaponStats.TotalDamageArmor += hurtEvent.ArmorDamage;
                weaponStats.TotalDamageHealth += hurtEvent.HealthDamage;
            }

            foreach (var killEvent in demo.Kills)
            {
                if (IsUnknownWeapon(killEvent.Weapon))
                {
                    continue;
                }

                var shouldIgnoreFocusedPlayerKill = _focusSteamId != 0 && killEvent.KillerSteamId != _focusSteamId;
                if (shouldIgnoreFocusedPlayerKill)
                {
                    continue;
                }

                var weaponStats = GetWeaponStatsByName(killEvent.Weapon.Name);
                weaponStats.KillCount++;
            }
        }
        public override void Generate()
        {
            foreach (var entry in _rowPerWeaponName)
            {
                var row = entry.Value;
                var cells = new List<object>
                {
                    entry.Key,
                    row.KillCount,
                    row.TotalDamageHealth,
                    row.TotalDamageArmor,
                    row.Shots,
                    row.Hits,
                    row.Accuracy,
                };
                WriteRow(cells);
            }
        }

        private WeaponSheetRow GetWeaponStatsByName(string weaponName)
        {
            if (!_rowPerWeaponName.ContainsKey(weaponName))
            {
                _rowPerWeaponName.Add(weaponName, new WeaponSheetRow());
            }

            return _rowPerWeaponName[weaponName];
        }

        private static bool IsUnknownWeapon(Weapon weapon)
        {
            return weapon.Element == EquipmentElement.Unknown;
        }
    }
}
