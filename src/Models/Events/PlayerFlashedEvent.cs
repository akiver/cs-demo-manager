namespace CSGO_Demos_Manager.Models.Events
{
	public class PlayerBlindedEvent : BaseEvent
	{
		public PlayerExtended Thrower { get; set; }

		public PlayerExtended Victim { get; set; }

		public Round Round { get; set; }

		public float Duration { get; set; }

		public PlayerBlindedEvent(int tick)
			: base(tick)
		{
		}
	}
}
