namespace Services.Models.Timelines
{
	public class HeThrownEventTimeline : StuffEventTimeline
	{
		public HeThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "he";
			Category = Properties.Resources.HE;
		}
	}
}
