using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class BombExplodedEvent : BaseEvent
    {
        [JsonProperty("site")] public string Site { get; set; }

        [JsonProperty("planter_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long PlanterSteamId { get; set; }

        [JsonProperty("planter_name")] public string PlanterName { get; set; }

        [JsonIgnore] public override string Message => "Bomb exploded on BP " + Site;

        public BombExplodedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
