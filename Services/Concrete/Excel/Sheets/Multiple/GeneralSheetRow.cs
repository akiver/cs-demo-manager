namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class GeneralSheetRow
    {
        public string Name { get; set; }
        public string Id { get; set; }
        public string Date { get; set; }
        public string Type { get; set; }
        public string Source { get; set; }
        public string MapName { get; set; }
        public string Hostname { get; set; }
        public string ClientName { get; set; }
        public float ServerTickrate { get; set; }
        public float Tickrate { get; set; }
        public float Duration { get; set; }
        public int Ticks { get; set; }
        public string TeamNameCT{ get; set; }
        public string TeamNameT{ get; set; }
        public int ScoreTeamCt { get; set; }
        public int ScoreTeamT { get; set; }
        public int ScoreFirstHalfTeamCt { get; set; }
        public int ScoreFirstHalfTeamT { get; set; }
        public int ScoreSecondHalfTeamCt { get; set; }
        public int ScoreSecondHalfTeamT { get; set; }
        public string WinnerName { get; set; }
        public int KillCount { get; set; }
        public int AssistCount { get; set; }
        public int FiveKillCount { get; set; }
        public int FourKillCount { get; set; }
        public int ThreeKillCount { get; set; }
        public int TwoKillCount { get; set; }
        public int OneKillCount { get; set; }
        public int TradeKillCount { get; set; }
        public double AverageHealthDamage { get; set; }
        public int DamageHealthCount { get; set; }
        public int DamageArmorCount { get; set; }
        public float AverageKast { get; set; }
        public int ClutchCount { get; set; }
        public int BombDefusedCount { get; set; }
        public int BombExplodedCount { get; set; }
        public int BombPlantedCount { get; set; }
        public int FlashbangThrownCount { get; set; }
        public int SmokeThrownCount { get; set; }
        public int HeThrownCount { get; set; }
        public int DecoyThrownCount { get; set; }
        public int MolotovThrownCount { get; set; }
        public int IncendiaryThrownCount { get; set; }
        public int WeaponFiredCount { get; set; }
        public int HitCount { get; set; }
        public int RoundCount { get; set; }
        public string Comment { get; set; }
        public int CheaterCount { get; set; }
    }
}
