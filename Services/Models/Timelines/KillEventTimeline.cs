namespace Services.Models.Timelines
{
	public class KillEventTimeline : TimelineEvent
	{
		public string KillerName { get; set; }
		public string VictimName { get; set; }
		public string WeaponName { get; set; }

		public KillEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
		{
			Type = "kill";
			Category = Properties.Resources.Kill;
			EventName = Properties.Resources.KillEventName;
		}
	}
}
