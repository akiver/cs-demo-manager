using Core.Models;

namespace Services.Models.Timelines
{
	public class MolotovThrownEventTimeline : StuffEventTimeline
	{
		public MolotovThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "molotov";
			StuffType = StuffType.MOLOTOV;
			Category = Properties.Resources.Molotov;
			EventName = Properties.Resources.MolotovEventName;
		}
	}
}
