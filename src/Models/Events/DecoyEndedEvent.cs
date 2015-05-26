namespace CSGO_Demos_Manager.Models.Events
{
	public class DecoyEndedEvent : NadeBaseEvent
	{
		public override string Message => "Decoy exploded";

		public DecoyEndedEvent(int tick)
			: base(tick)
		{
		}
	}
}