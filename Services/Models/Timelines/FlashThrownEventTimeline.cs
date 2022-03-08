using Core.Models;

namespace Services.Models.Timelines
{
    public class FlashThrownEventTimeline : StuffEventTimeline
    {
        public FlashThrownEventTimeline(float tickrate, int startTick, int endTick) : base(tickrate, startTick, endTick)
        {
            Type = "flash";
            StuffType = StuffType.FLASHBANG;
            Category = Properties.Resources.Flashbang;
            EventName = Properties.Resources.FlashbangEventName;
        }
    }
}
