namespace Core.Models.Events
{
    public class SmokeNadeEndedEvent : NadeBaseEvent
    {
        public SmokeNadeEndedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
