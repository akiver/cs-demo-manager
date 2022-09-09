using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class KillSheetRow
    {
        public int Tick { get; set; }
        public int RoundNumber { get; set; }
        public float TimeDeathSeconds { get; set; }
        public string KillerName { get; set; }
        public long KillerSteamId { get; set; }
        public Side KillerSide { get; set; }
        public string KillerTeamName { get; set; }
        public bool KillerIsControllingBot { get; set; }
        public bool KillerIsBlinded { get; set; }
        public float KillerVelocityX { get; set; }
        public float KillerVelocityY { get; set; }
        public float KillerVelocityZ { get; set; }
        public string VictimName { get; set; }
        public long VictimSteamId { get; set; }
        public Side VictimSide { get; set; }
        public string VictimTeamName { get; set; }
        public bool VictimIsControllingBot { get; set; }
        public bool VictimIsBlinded { get; set; }
        public string AssisterName { get; set; }
        public long AssisterSteamId { get; set; }
        public bool AssisterIsControllingBot { get; set; }
        public string WeaponName { get; set; }
        public bool IsHeadshot { get; set; }
        public bool IsKillerCrouching { get; set; }
        public bool IsTradeKill { get; set; }
        public float KillerX { get; set; }
        public float KillerY { get; set; }
        public float KillerZ { get; set; }
        public float VictimX { get; set; }
        public float VictimY { get; set; }
        public float VictimZ { get; set; }
    }
}
