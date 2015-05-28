using System.Collections.Generic;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class FlashbangExplodedEvent : NadeBaseEvent
	{
		[JsonProperty("players_flashed")]
		public List<PlayerExtended> FlashedPlayers { get; set; }

		[JsonIgnore]
		public override string Message => "Flashbang explosed";

		public FlashbangExplodedEvent(int tick)
			: base(tick)
		{
			FlashedPlayers = new List<PlayerExtended>();
		}
	}
}
