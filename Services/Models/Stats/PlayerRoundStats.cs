namespace Services.Models.Stats
{
    /// <summary>
    /// Contains some stats about a player for a specific round
    /// </summary>
    public class PlayerRoundStats
    {
        public int Number { get; set; }

        public int Tick { get; set; }

        public string Name { get; set; }

        public int ShotCount { get; set; }

        public int HitCount { get; set; }

        public double Accuracy { get; set; }

        public int DamageHealthCount { get; set; }

        public int DamageArmorCount { get; set; }

        public int TimeDeath { get; set; }

        public int KillCount { get; set; }

        public int JumpKillCount { get; set; }

        public int StartMoneyValue { get; set; }

        public int EquipementValue { get; set; }

        public int AssistCount { get; set; }

        public int DeathCount { get; set; }

        public int HeadshotCount { get; set; }

        public int CrouchKillCount { get; set; }

        public int OneKillCount { get; set; }

        public int TwoKillCount { get; set; }

        public int ThreeKillCount { get; set; }

        public int FourKillCount { get; set; }

        public int FiveKillCount { get; set; }

        public int BombPlantedCount { get; set; }

        public int BombDefusedCount { get; set; }

        public int BombExplodedCount { get; set; }

        public int TeamKillCount { get; set; }

        public int TradeKillCount { get; set; }

        public int TradeDeathCount { get; set; }
    }
}
