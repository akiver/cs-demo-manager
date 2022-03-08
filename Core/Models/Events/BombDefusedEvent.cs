using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class BombDefusedEvent : BaseEvent
    {
        [JsonProperty("defuser_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long DefuserSteamId { get; set; }

        [JsonProperty("defuser_name")] public string DefuserName { get; set; }

        [JsonProperty("site")] public string Site { get; set; }

        [JsonIgnore] public override string Message => "Bomb defused on BP " + Site + " by " + DefuserName;

        public BombDefusedEvent(int tick, float seconds)
            : base(tick, seconds)
        {
        }
    }
}
