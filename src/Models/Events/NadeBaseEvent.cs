namespace CSGO_Demos_Manager.Models.Events
{
	public class NadeBaseEvent : BaseEvent
	{
		public PlayerExtended Thrower { get; set; }

		public HeatmapPoint Point { get; set; }

		public NadeBaseEvent(int tick)
			: base(tick)
		{
			Thrower = new PlayerExtended();
		}
	}
}
