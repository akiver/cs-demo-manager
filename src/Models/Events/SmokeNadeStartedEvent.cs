namespace CSGO_Demos_Manager.Models.Events
{
	public class SmokeNadeStartedEvent : NadeBaseEvent
	{
		public SmokeNadeStartedEvent(int tick)
			: base(tick)
		{
		}
	}
}
