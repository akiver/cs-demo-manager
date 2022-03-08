using System.Collections.Generic;
using Core.Models;

namespace Services.Models.Heatmap
{
    public class HeatmapConfiguration
    {
        public Demo Demo { get; set; }

        /// <summary>
        /// Event ID
        /// </summary>
        public string SelectedEventId { get; set; }

        /// <summary>
        /// Side(s) selected
        /// </summary>
        public List<string> SelectedSideList { get; set; }

        /// <summary>
        /// Player(s) selected
        /// </summary>
        public List<Player> SelectedPlayerList { get; set; }

        /// <summary>
        /// Round(s) selected
        /// </summary>
        public List<Round> SelectedRoundList { get; set; }
    }
}
