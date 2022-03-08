using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class MolotovFireEndedEvent : NadeBaseEvent
    {
        [JsonIgnore] public override string Message => "Molotov ended";

        public MolotovFireEndedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
