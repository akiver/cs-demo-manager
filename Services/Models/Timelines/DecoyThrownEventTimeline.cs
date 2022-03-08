using Core.Models;

namespace Services.Models.Timelines
{
    public class DecoyThrownEventTimeline : StuffEventTimeline
    {
        public DecoyThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "decoy";
            StuffType = StuffType.DECOY;
            Category = Properties.Resources.Decoy;
            EventName = Properties.Resources.DecoyEventName;
        }
    }
}
