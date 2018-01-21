namespace Services.Models.Timelines
{
	public class FlashThrownEventTimeline : StuffEventTimeline
	{
		public FlashThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "flash";
			Category = Properties.Resources.Flashbang;
		}
	}
}
