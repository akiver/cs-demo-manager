namespace Services.Models.Timelines
{
    public class RoundEventTimeline : TimelineEvent
    {
        public int Number { get; set; }
        public string RoundStartEventName { get; set; }
        public string RoundEndEventName { get; set; }

        public RoundEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "round_start";
            Category = Properties.Resources.Round;
            RoundStartEventName = Properties.Resources.RoundStartEventName;
            RoundEndEventName = Properties.Resources.RoundEndEventName;
        }
    }
}
