namespace Services.Models.Timelines
{
    public class StartTickEventMarkerTimeline : TimelineEvent
    {
        public StartTickEventMarkerTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "start_tick";
            Category = "Markers";
        }
    }
}
