using Core.Models;

namespace Services.Models.Timelines
{
    public class SmokeThrownEventTimeline : StuffEventTimeline
    {
        public SmokeThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "smoke";
            StuffType = StuffType.SMOKE;
            Category = Properties.Resources.Smoke;
            EventName = Properties.Resources.SmokeEventName;
        }
    }
}
