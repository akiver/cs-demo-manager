namespace Services.Models.Timelines
{
	public class MolotovThrownEventTimeline : StuffEventTimeline
	{
		public MolotovThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "molotov";
			Category = Properties.Resources.Molotov;
		}
	}
}
