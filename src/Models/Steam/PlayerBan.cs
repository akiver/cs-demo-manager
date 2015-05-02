namespace CSGO_Demos_Manager.Models.Steam
{
	public class PlayerBan
	{
		public string SteamId { get; set; }

		public bool CommunityBanned { get; set; }

		public bool VacBanned { get; set; }

		public int NumberOfVacBans { get; set; }

		public int DaysSinceLastBan { get; set; }

		public string EconomyBan { get; set; }
	}
}
