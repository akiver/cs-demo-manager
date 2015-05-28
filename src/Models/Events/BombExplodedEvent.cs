using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BombExplodedEvent : BaseEvent
	{
		[JsonProperty("bomb_site")]
		public string Site { get; set; }

		[JsonProperty("planter")]
		public PlayerExtended Player { get; set; }

		[JsonIgnore]
		public override string Message => "Bomb exploded on BP " + Site;

		public BombExplodedEvent(int tick)
			: base(tick)
		{
		}
	}
}