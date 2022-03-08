using System.Collections.Generic;
using Core.Models;

namespace Services.Models.Heatmap
{
    public class HeatmapPointComparer : IEqualityComparer<HeatmapPoint>
    {
        public bool Equals(HeatmapPoint x, HeatmapPoint y)
        {
            return x.X.Equals(y.X) && x.Y.Equals(y.Y);
        }

        public int GetHashCode(HeatmapPoint obj)
        {
            return obj.X.GetHashCode() ^ obj.Y.GetHashCode();
        }
    }
}
