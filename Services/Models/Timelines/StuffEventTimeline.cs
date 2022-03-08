using Core.Models;

namespace Services.Models.Timelines
{
    public class StuffEventTimeline : TimelineEvent
    {
        public string ThrowerName { get; set; }
        public StuffType StuffType { get; set; }

        public StuffEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
        }
    }
}
