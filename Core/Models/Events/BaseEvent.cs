using GalaSoft.MvvmLight;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class BaseEvent : ObservableObject
    {
        [JsonProperty("tick")] public int Tick { get; set; }

        [JsonProperty("seconds")] public float Seconds { get; set; }

        [JsonIgnore] public virtual string Message { get; set; }

        public BaseEvent(int tick, float seconds)
        {
            Tick = tick;
            Seconds = seconds;
        }
    }
}
