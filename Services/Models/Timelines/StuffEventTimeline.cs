namespace Services.Models.Timelines
{
	public class StuffEventTimeline : TimelineEvent
	{
		public string ThrowerName { get; set; }
		public string StuffType => Category.ToLower();

		public StuffEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
		}
	}
}
