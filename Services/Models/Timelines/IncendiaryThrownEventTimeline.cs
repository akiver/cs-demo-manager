using Core.Models;

namespace Services.Models.Timelines
{
	public class IncendiaryThrownEventTimeline : StuffEventTimeline
	{
		public IncendiaryThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "incendiary";
			StuffType = StuffType.INCENDIARY;
			Category = Properties.Resources.Incendiary;
			EventName = Properties.Resources.IncendiaryEventName;
		}
	}
}
