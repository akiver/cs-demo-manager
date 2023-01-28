using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class NadeBaseEvent : BaseEvent
    {
        [JsonProperty("thrower_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long ThrowerSteamId { get; set; }

        [JsonProperty("thrower_name")] public string ThrowerName { get; set; }

        [JsonProperty("thrower_side")]
        public Side ThrowerSide { get; set; }

        [JsonProperty("heatmap_point")] public HeatmapPoint Point { get; set; }

        [JsonProperty("round_number")] public int RoundNumber { get; set; }

        public NadeBaseEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
