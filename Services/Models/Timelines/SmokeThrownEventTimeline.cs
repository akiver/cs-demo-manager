namespace Services.Models.Timelines
{
	public class SmokeThrownEventTimeline : StuffEventTimeline
	{
		public SmokeThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "smoke";
			Category = Properties.Resources.Smoke;
		}
	}
}
