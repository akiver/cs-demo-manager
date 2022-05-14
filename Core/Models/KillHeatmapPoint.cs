using Newtonsoft.Json;

namespace Core.Models
{
    public class KillHeatmapPoint : HeatmapPoint
    {
        [JsonProperty("killer_x")]
        public float KillerX { get; set; }

        [JsonProperty("killer_y")]
        public float KillerY { get; set; }

        [JsonProperty("killer_z")]
        public float KillerZ { get; set; }

        [JsonProperty("victim_x")]
        public float VictimX { get; set; }

        [JsonProperty("victim_y")]
        public float VictimY { get; set; }

        [JsonProperty("victim_z")]
        public float VictimZ { get; set; }

        public override bool Equals(object obj)
        {
            var item = (KillHeatmapPoint)obj;

            if (item == null)
            {
                return false;
            }

            return KillerX.Equals(item.KillerX)
                   && KillerY.Equals(item.KillerY)
                   && KillerZ.Equals(item.KillerZ)
                   && VictimX.Equals(item.VictimX)
                   && VictimY.Equals(item.VictimY)
                   && VictimZ.Equals(item.VictimZ);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
}
