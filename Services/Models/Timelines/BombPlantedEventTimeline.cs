namespace Services.Models.Timelines
{
	public class BombPlantedEventTimeline : TimelineEvent
	{
		public string PlanterName { get; set; }
		public string Site { get; set; }

		public BombPlantedEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "bomb_planted";
			Category = Properties.Resources.Bomb;
			EventName = Properties.Resources.BombPlantedEventName;
		}
	}
}
