using Newtonsoft.Json;

namespace Core.Models
{
    public class KillHeatmapPoint : HeatmapPoint
    {
        [JsonProperty("killer_x")] public float KillerX { get; set; }

        [JsonProperty("killer_y")] public float KillerY { get; set; }

        [JsonProperty("victim_x")] public float VictimX { get; set; }

        [JsonProperty("victim_y")] public float VictimY { get; set; }

        public override bool Equals(object obj)
        {
            var item = (KillHeatmapPoint)obj;

            if (item == null)
            {
                return false;
            }

            return KillerX.Equals(item.KillerX)
                   && KillerY.Equals(item.KillerY)
                   && VictimX.Equals(item.VictimX)
                   && VictimY.Equals(item.VictimY);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
}
