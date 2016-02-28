using System;

namespace CSGO_Demos_Manager.Models.Excel
{
	public class PlayerStats
	{
		public int MatchCount { get; set; }

		public int KillCount { get; set; }

		public int AssistCount { get; set; }

		public int DeathCount { get; set; }

		public decimal KillPerDeath => DeathCount == 0 ? KillCount : Math.Round((decimal)KillCount / DeathCount, 2);

		public int HeadshotCount { get; set; }

		public decimal HeadshotPercent => HeadshotCount == 0 ? 0 : Math.Round((decimal)(KillCount * 100) / HeadshotCount, 2);

		public int RoundCount { get; set; }

		public float Rating { get; set; }

		public int FiveKillCount { get; set; }

		public int FourKillCount { get; set; }

		public int ThreeKillCount { get; set; }

		public int TwoKillCount { get; set; }

		public int OneKillCount { get; set; }

		public int TeamKillCount { get; set; }

		public int JumpKillCount { get; set; }

		public int CrouchKillCount { get; set; }

		public int BombPlantedCount { get; set; }

		public int BombDefusedCount { get; set; }

		public int BombExplodedCount { get; set; }

		public int MvpCount { get; set; }

		public int ScoreCount { get; set; }

		public int ClutchCount { get; set; }

		public int ClutchLostCount { get; set; }

		public int Clutch1V1Count { get; set; }

		public int Clutch1V2Count { get; set; }

		public int Clutch1V3Count { get; set; }

		public int Clutch1V4Count { get; set; }

		public int Clutch1V5Count { get; set; }

		public int EntryKillCount { get; set; }

		public int EntryKillWinCount { get; set; }

		public int EntryKillLossCount { get; set; }

		public decimal EntryKillWinPercent => EntryKillCount == 0 ? 0 : Math.Round((decimal)(EntryKillWinCount * 100) / EntryKillCount, 2);

		public int OpenKillCount { get; set; }

		public int OpenKillWinCount { get; set; }

		public int OpenKillLossCount { get; set; }

		public int TradeKillCount { get; set; }

		public int TradeDeathCount { get; set; }

		public decimal OpenKillWinPercent => OpenKillCount == 0 ? 0 : Math.Round((decimal)(OpenKillWinCount * 100) / OpenKillCount, 2);

		public decimal KillPerRound => RoundCount == 0 ? 0 : Math.Round((decimal)KillCount / RoundCount, 2);

		public decimal AssistPerRound => RoundCount == 0 ? 0 : Math.Round((decimal)AssistCount / RoundCount, 2);

		public decimal DeathPerRound => RoundCount == 0 ? 0 : Math.Round((decimal)DeathCount / RoundCount, 2);

		public decimal AverageDamagePerRound => RoundCount == 0 ? 0 : Math.Round((decimal)DamageHealthCount / RoundCount, 2);

		public int DamageHealthCount { get; set; }

		public int DamageArmorCount { get; set; }

		public int FlashbangThrownCount { get; set; }

		public int SmokeThrownCount { get; set; }

		public int HeGrenadeThrownCount { get; set; }

		public int DecoyThrownCount { get; set; }

		public int MolotovThrownCount { get; set; }

		public int IncendiaryThrownCount { get; set; }

		public int RankMax { get; set; }

		public bool IsVacBanned { get; set; }

		public bool IsOverwatchBanned { get; set; }
	}
}