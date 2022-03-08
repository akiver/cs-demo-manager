namespace Services.Models.Timelines
{
    public class BombExplodedEventTimeline : TimelineEvent
    {
        public string PlanterName { get; set; }
        public string Site { get; set; }

        public BombExplodedEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "bomb_exploded";
            Category = Properties.Resources.Bomb;
            EventName = Properties.Resources.BombExplodedEventName;
        }
    }
}
