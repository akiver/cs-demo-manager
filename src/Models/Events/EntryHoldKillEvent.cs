using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class EntryHoldKillEvent : BaseEvent
	{
		[JsonProperty("round_number")]
		public int RoundNumber { get; set; }

		[JsonProperty("killer_steamid")]
		public long KillerSteamId { get; set; }

		[JsonProperty("killer_name")]
		public string KillerName { get; set; }

		[JsonProperty("killer_side")]
		public Team KillerSide { get; set; }

		[JsonProperty("killed_steamid")]
		public long KilledSteamId { get; set; }

		[JsonProperty("killed_name")]
		public string KilledName { get; set; }

		[JsonProperty("killed_side")]
		public Team KilledSide { get; set; }

		[JsonProperty("weapon")]
		public Weapon Weapon { get; set; }

		[JsonProperty("has_won")]
		public bool HasWon { get; set; }

		[JsonProperty("has_won_round")]
		public bool HasWonRound { get; set; }

		public EntryHoldKillEvent(int tick, float seconds) : base(tick, seconds) { }

		public EntryHoldKillEvent Clone()
		{
			return (EntryHoldKillEvent)MemberwiseClone();
		}
	}
}
