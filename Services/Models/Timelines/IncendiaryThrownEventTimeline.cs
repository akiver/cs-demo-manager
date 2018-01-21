namespace Services.Models.Timelines
{
	public class IncendiaryThrownEventTimeline : StuffEventTimeline
	{
		public IncendiaryThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "incendiary";
			Category = "Incendiary"; // TODO translate
		}
	}
}
