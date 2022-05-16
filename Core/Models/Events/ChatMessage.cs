using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class ChatMessage : BaseEvent
    {
        [JsonProperty("sender_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long SenderSteamId { get; set; }

        [JsonProperty("sender_name")]
        public string SenderName { get; set; }

        [JsonProperty("sender_side")]
        public Side SenderSide { get; set; }

        [JsonProperty("is_sender_alive")]
        public bool IsSenderAlive { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }


        public ChatMessage(int tick, float seconds)
            : base(tick, seconds)
        {
        }
    }
}
