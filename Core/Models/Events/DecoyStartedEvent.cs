using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class DecoyStartedEvent : NadeBaseEvent
    {
        [JsonIgnore] public override string Message => "Decoy started";

        public DecoyStartedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
