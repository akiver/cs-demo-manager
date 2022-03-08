namespace Services.Models.Timelines
{
    public class EndTickEventMarkerTimeline : TimelineEvent
    {
        public EndTickEventMarkerTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "end_tick";
            Category = "Markers";
        }
    }
}
