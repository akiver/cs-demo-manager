using Newtonsoft.Json;

namespace Core.Models
{
    public class HeatmapPoint : MapPoint
    {
        [JsonIgnore] public byte Intensity { get; set; } = 100;
    }
}
