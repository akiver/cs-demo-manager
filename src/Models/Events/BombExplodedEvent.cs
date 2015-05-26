namespace CSGO_Demos_Manager.Models.Events
{
	public class BombExplodedEvent : BaseEvent
	{
		public string Site { get; set; }

		public PlayerExtended Player { get; set; }

		public override string Message => "Bomb exploded";

		public BombExplodedEvent(int tick)
			: base(tick)
		{
		}
	}
}