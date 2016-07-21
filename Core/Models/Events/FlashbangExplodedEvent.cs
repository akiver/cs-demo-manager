using System.Collections.Generic;
using Newtonsoft.Json;

namespace Core.Models.Events
{
	public class FlashbangExplodedEvent : NadeBaseEvent
	{
		[JsonProperty("flashed_players_steamid")]
		public List<long> FlashedPlayerSteamIdList { get; set; } = new List<long>();

		[JsonIgnore]
		public override string Message => "Flashbang exploded";

		public FlashbangExplodedEvent(int tick, float seconds): base(tick, seconds) { }
	}
}
