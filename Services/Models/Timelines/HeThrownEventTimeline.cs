using Core.Models;

namespace Services.Models.Timelines
{
	public class HeThrownEventTimeline : StuffEventTimeline
	{
		public HeThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "he";
			StuffType = StuffType.HE;
			Category = Properties.Resources.HE;
			EventName = Properties.Resources.HEEventName;
		}
	}
}
