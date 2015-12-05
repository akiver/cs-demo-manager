using System;

namespace CSGO_Demos_Manager.Models
{
	public class OverallStats
	{
		public int MatchCount { get; set; } = 0;

		public int KillCount { get; set; } = 0;

		public int AssistCount { get; set; } = 0;

		public int DeathCount { get; set; } = 0;

		public int HeadshotCount { get; set; } = 0;

		public decimal HeadshotRatio { get; set; } = 0;

		public decimal KillDeathRatio { get; set; } = 0;

		public int EntryKillCount { get; set; } = 0;

		public int KnifeKillCount { get; set; } = 0;

		public int FiveKillCount { get; set; } = 0;

		public int FourKillCount { get; set; } = 0;

		public int ThreeKillCount { get; set; } = 0;

		public int TwoKillCount { get; set; } = 0;

		public int BombPlantedCount { get; set; } = 0;

		public int BombDefusedCount { get; set; } = 0;

		public int BombExplodedCount { get; set; } = 0;

		public int DamageCount { get; set; } = 0;

		public int MvpCount { get; set; } = 0;

		public int MatchWinCount { get; set; } = 0;

		public int MatchLossCount { get; set; } = 0;

		public int MatchDrawCount { get; set; } = 0;

		public int RoundCount { get; set; } = 0;

		public int ClutchCount { get; set; } = 0;

		public int ClutchWin { get; set; } = 0;

		public double KillPerRoundPercentage
		{
			get
			{
				if (RoundCount == 0) return 0;
				return Math.Round((double)KillCount / RoundCount, 2);
			}
		}

		public double AssistPerRoundPercentage
		{
			get
			{
				if (RoundCount == 0) return 0;
				return Math.Round((double)AssistCount / RoundCount, 2);
			}
		}

		public double DeathPerRoundPercentage
		{
			get
			{
				if (RoundCount == 0) return 0;
				return Math.Round((double)DeathCount / RoundCount, 2);
			}
		}

		public double ClutchWinPercentage
		{
			get
			{
				if (ClutchCount == 0) return 0;
				return Math.Round((ClutchWin * 100) / (double)ClutchCount, 2);
			}
		}

		public double AverageDamagesPerRound
		{
			get
			{
				if (RoundCount == 0) return 0;
				return Math.Round((double)DamageCount / RoundCount, 2);
			}
		}
	}
}