using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class ClutchEvent : BaseEvent
    {
        [JsonProperty("opponent_count")] public int OpponentCount { get; set; }

        [JsonProperty("has_won")] public bool HasWon { get; set; }

        [JsonProperty("round_number")] public int RoundNumber { get; set; }

        public ClutchEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
