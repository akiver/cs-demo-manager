using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BombPlantedEvent : BaseEvent
	{
		[JsonProperty("planter_steamid")]
		public long PlanterSteamId { get; set; }

		[JsonProperty("planter_name")]
		public string PlanterName { get; set; }

		[JsonProperty("site")]
		public string Site { get; set; }

		[JsonIgnore]
		public float X { get; set; }

		[JsonIgnore]
		public float Y { get; set; }

		[JsonIgnore]
		public override string Message => "Bomb planted by " + PlanterName + " on BP " + Site;

		public BombPlantedEvent(int tick) : base(tick)
		{
		}
	}
}
