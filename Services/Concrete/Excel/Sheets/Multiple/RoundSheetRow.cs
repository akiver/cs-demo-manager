using Core.Models;
using DemoInfo;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class RoundSheetRow
    {
        public int Number { get; set; }
        public int Tick { get; set; }
        public double Duration { get; set; }
        public string WinnerName { get; set; }
        public Side WinnerSide { get; set; }
        public RoundEndReason EndReason { get; set; }
        public RoundType Type { get; set; }
        public Side SideTrouble { get; set; }
        public string TeamTroubleName { get; set; }
        public int KillCount { get; set; }
        public int OneKillCount { get; set; }
        public int TwoKillCount { get; set; }
        public int ThreeKillCount { get; set; }
        public int FourKillCount { get; set; }
        public int FiveKillCount { get; set; }
        public int TradeKillCount { get; set; }
        public int JumpKillCount { get; set; }
        public double AverageHealthDamagePerPlayer { get; set; }
        public int DamageHealth { get; set; }
        public int DamageArmorCount { get; set; }
        public int BombExplodedCount { get; set; }
        public int BombPlantedCount { get; set; }
        public int BombDefusedCount { get; set; }
        public int StartMoneyTeamCT { get; set; }
        public int StartMoneyTeamT { get; set; }
        public int EquipmentValueTeamCT { get; set; }
        public int EquipmentValueTeamT { get; set; }
        public int FlashbangCount { get; set; }
        public int SmokeCount { get; set; }
        public int HeGrenadeCount { get; set; }
        public int DecoyCount { get; set; }
        public int MolotovCount { get; set; }
        public int IncendiaryCount { get; set; }
    }
}
