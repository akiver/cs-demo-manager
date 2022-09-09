using System;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class WeaponSheetRow
    {
        public int KillCount { get; set; }

        public int TotalDamageHealth { get; set; }

        public int TotalDamageArmor { get; set; }

        public int Shots { get; set; }

        public int Hits { get; set; }

        public decimal Accuracy => Shots == 0 ? 0 : Math.Round((decimal)(Hits * 100) / Shots, 2);
    }
}
