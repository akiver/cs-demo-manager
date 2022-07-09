using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class PlayerBlindedEvent : BaseEvent
    {
        [JsonProperty("thrower_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long ThrowerSteamId { get; set; }

        [JsonProperty("thrower_name")] public string ThrowerName { get; set; }

        [JsonProperty("thrower_team_name")] public string ThrowerTeamName { get; set; }

        [JsonProperty("victim_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long VictimSteamId { get; set; }

        [JsonProperty("victim_name")] public string VictimName { get; set; }

        [JsonProperty("victim_team_name")] public string VictimTeamName { get; set; }

        [JsonProperty("round_number")] public int RoundNumber { get; set; }

        [JsonProperty("duration")] public float Duration { get; set; }

        [JsonIgnore]
        public bool IsThrowerBot => ThrowerSteamId == 0;

        [JsonIgnore]
        public bool IsVictimBot => VictimSteamId == 0;

        public PlayerBlindedEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
