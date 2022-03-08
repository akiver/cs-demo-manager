using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class BombPlantedEvent : BaseEvent
    {
        [JsonProperty("planter_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long PlanterSteamId { get; set; }

        [JsonProperty("planter_name")] public string PlanterName { get; set; }

        [JsonProperty("site")] public string Site { get; set; }

        [JsonIgnore] public float X { get; set; }

        [JsonIgnore] public float Y { get; set; }

        [JsonIgnore] public override string Message => "Bomb planted by " + PlanterName + " on BP " + Site;

        public BombPlantedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
