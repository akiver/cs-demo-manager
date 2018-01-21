namespace Services.Models.Timelines
{
	public class BombDefusedEventTimeline : TimelineEvent
	{
		public string DefuserName { get; set; }
		public string Site { get; set; }

		public BombDefusedEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Category = Properties.Resources.Bomb;
			Type = "bomb_defused";
		}
	}
}
