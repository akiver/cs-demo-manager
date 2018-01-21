namespace Services.Models.Timelines
{
	public class BombPlantedEventTimeline : TimelineEvent
	{
		public string PlanterName { get; set; }
		public string Site { get; set; }

		public BombPlantedEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Category = Properties.Resources.Bomb;
			Type = "bomb_planted";
		}
	}
}
