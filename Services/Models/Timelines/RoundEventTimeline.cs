namespace Services.Models.Timelines
{
	public class RoundEventTimeline : TimelineEvent
	{
		public int Number { get; set; }

		public RoundEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "round_start";
			Category = "Rounds"; // TODO translate
		}
	}
}
