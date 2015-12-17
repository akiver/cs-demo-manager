using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BombExplodedEvent : BaseEvent
	{
		[JsonProperty("site")]
		public string Site { get; set; }

		[JsonProperty("planter_steamid")]
		public long PlanterSteamId { get; set; }

		[JsonProperty("planter_name")]
		public string PlanterName { get; set; }

		[JsonIgnore]
		public override string Message => "Bomb exploded on BP " + Site;

		public BombExplodedEvent(int tick)
			: base(tick)
		{
		}
	}
}