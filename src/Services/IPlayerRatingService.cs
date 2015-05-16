namespace CSGO_Demos_Manager.Services
{
	public interface IPlayerRatingService
	{
		/// <summary>
		/// Compute HLTV.org's player rating (http://www.hltv.org/?pageid=242&eventid=0) for a game
		/// </summary>
		/// <param name="numberOfRounds">total number of rounds for the game</param>
		/// <param name="kills">number of kills of a player during the whole game</param>
		/// <param name="deaths">number of deaths of a player during the whole game</param>
		/// <param name="nKills">an array of int containing the total number of x kills in a round during a game for a player. nKills[0] = number of 1 kill, nKills[1] = number of 2 kills, ...</param>
		/// <returns></returns>
		double ComputeHltvOrgRating(int numberOfRounds, int kills, int deaths, int[] nKills);
	}
}
