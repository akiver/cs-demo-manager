using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class NadeBaseEvent : BaseEvent
	{
		[JsonProperty("thrower_steamid")]
		public long ThrowerSteamId { get; set; }

		[JsonProperty("thrower_name")]
		public string ThrowerName { get; set; }

		[JsonIgnore]
		public HeatmapPoint Point { get; set; }

		public NadeBaseEvent(int tick)
			: base(tick)
		{
		}
	}
}
