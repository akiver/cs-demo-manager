namespace Core.Models.Events
{
    public class SmokeNadeStartedEvent : NadeBaseEvent
    {
        public SmokeNadeStartedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
