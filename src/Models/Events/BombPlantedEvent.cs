namespace CSGO_Demos_Manager.Models.Events
{
	public class BombPlantedEvent : BaseEvent
	{
		public PlayerExtended Player { get; set; }

		public string Site { get; set; }

		public float X { get; set; }

		public float Y { get; set; }

		public BombPlantedEvent(int tick) : base(tick)
		{
			Player = new PlayerExtended();
		}
	}
}
