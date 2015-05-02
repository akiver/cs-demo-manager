namespace CSGO_Demos_Manager.Models.Events
{
	public class BombDefusedEvent : BaseEvent
	{
		public PlayerExtended Player { get; set; }

		public string Site { get; set; }

		public BombDefusedEvent(int tick)
			: base(tick)
		{
			Player = new PlayerExtended();
		}
	}
}
