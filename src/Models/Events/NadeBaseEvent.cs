using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class NadeBaseEvent : BaseEvent
	{
		[JsonProperty("thrower")]
		public PlayerExtended Thrower { get; set; }

		[JsonIgnore]
		public HeatmapPoint Point { get; set; }

		public NadeBaseEvent(int tick)
			: base(tick)
		{
			Thrower = new PlayerExtended();
		}
	}
}
