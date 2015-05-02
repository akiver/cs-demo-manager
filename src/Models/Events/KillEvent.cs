namespace CSGO_Demos_Manager.Models.Events
{
	public class KillEvent : BaseEvent
	{
		public PlayerExtended Killer { get; set; }

		public PlayerExtended DeathPerson { get; set; }

		public PlayerExtended Assister { get; set; }

		public HeatmapPoint Point { get; set; }

		public Weapon Weapon { get; set; }

		public KillEvent(int tick)
			: base(tick)
		{
		}
	}
}
