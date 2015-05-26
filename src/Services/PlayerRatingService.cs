using System;

namespace CSGO_Demos_Manager.Services
{
	public class PlayerRatingService : IPlayerRatingService
	{
		// (average kills per round)
		const double AVERAGE_KPR = 0.679;
		// (average survived rounds per round)
		const double AVERAGE_SPR = 0.317;
		// (average value calculated from rounds with multiple kills: (1K + 4*2K + 9*3K + 16*4K + 25*5K)/Rounds) 
		const double AVERAGE_RMK = 1.277;

		public double ComputeHltvOrgRating(int roundCount, int kills, int deaths, int[] nKills)
		{
			// Kills/Rounds/AverageKPR
			double killRating = kills / (double)roundCount / AVERAGE_KPR;
			// (Rounds-Deaths)/Rounds/AverageSPR
			double survivalRating = (roundCount - deaths) / (double)roundCount / AVERAGE_SPR;
			// (1K + 4*2K + 9*3K + 16*4K + 25*5K)/Rounds/AverageRMK
			double roundsWithMultipleKillsRating = (nKills[0] + 4 * nKills[1] + 9 * nKills[2] + 16 * nKills[3] + 25 * nKills[4]) / (double)roundCount / AVERAGE_RMK;

			return Math.Round((killRating + 0.7 * survivalRating + roundsWithMultipleKillsRating) / 2.7, 3);
		}
	}
}
