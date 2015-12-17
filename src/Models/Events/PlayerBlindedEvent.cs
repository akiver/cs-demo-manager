using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class PlayerBlindedEvent : BaseEvent
	{
		[JsonProperty("thrower_steamid")]
		public long ThrowerSteamId { get; set; }

		[JsonProperty("thrower_name")]
		public string ThrowerName { get; set; }

		[JsonProperty("thrower_team_name")]
		public string ThrowerTeamName { get; set; }

		[JsonProperty("victim_steamid")]
		public long VictimSteamId { get; set; }

		[JsonProperty("victim_name")]
		public string VictimName { get; set; }

		[JsonProperty("victim_team_name")]
		public string VictimTeamName { get; set; }

		[JsonProperty("round_number")]
		public int RoundNumber { get; set; }

		[JsonProperty("duration")]
		public float Duration { get; set; }

		public PlayerBlindedEvent(int tick)
			: base(tick) { }
	}
}
