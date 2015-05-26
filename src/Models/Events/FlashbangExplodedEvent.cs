using System.Collections.Generic;

namespace CSGO_Demos_Manager.Models.Events
{
	public class FlashbangExplodedEvent : NadeBaseEvent
	{
		public List<PlayerExtended> FlashedPlayers { get; set; }

		public override string Message => "Flashbang explosed";

		public FlashbangExplodedEvent(int tick)
			: base(tick)
		{
			FlashedPlayers = new List<PlayerExtended>();
		}
	}
}
