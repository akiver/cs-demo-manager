namespace CSGO_Demos_Manager.Models.Events
{
	public class SmokeNadeEndedEvent : NadeBaseEvent
	{
		public SmokeNadeEndedEvent(int tick)
			: base(tick)
		{
		}
	}
}