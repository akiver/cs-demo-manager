using System;

namespace CSGO_Demos_Manager.Services
{
	public class PlayerRatingService : IPlayerRatingService
	{
		public double ComputeHltvOrgRating(int numberOfRounds, int kills, int deaths, int[] nKills)
		{
			const double AVERAGE_KPR = 0.679; // (average kills per round)
			const double AVERAGE_SPR = 0.317; // (average survived rounds per round)
			const double AVERAGE_RMK = 1.277; // (average value calculated from rounds with multiple kills: (1K + 4*2K + 9*3K + 16*4K + 25*5K)/Rounds) 

			int Rounds = numberOfRounds;

			double KillRating = kills / (double)Rounds / AVERAGE_KPR; // Kills/Rounds/AverageKPR
			double SurvivalRating = (Rounds - deaths) / (double)Rounds / AVERAGE_SPR; // (Rounds-Deaths)/Rounds/AverageSPR
			double RoundsWithMultipleKillsRating = (nKills[0] + 4 * nKills[1] + 9 * nKills[2] + 16 * nKills[3] + 25 * nKills[4]) / (double)Rounds / AVERAGE_RMK; // (1K + 4*2K + 9*3K + 16*4K + 25*5K)/Rounds/AverageRMK 

			return Math.Round((KillRating + 0.7 * SurvivalRating + RoundsWithMultipleKillsRating) / 2.7, 3);
        }
	}
}
