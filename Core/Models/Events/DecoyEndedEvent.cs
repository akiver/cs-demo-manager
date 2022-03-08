using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class DecoyEndedEvent : NadeBaseEvent
    {
        [JsonIgnore] public override string Message => "Decoy exploded";

        public DecoyEndedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
