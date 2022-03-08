using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class ExplosiveNadeExplodedEvent : NadeBaseEvent
    {
        [JsonIgnore] public override string Message => "HE grenade exploded";

        public ExplosiveNadeExplodedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
