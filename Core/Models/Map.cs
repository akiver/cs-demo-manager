namespace Core.Models
{
    /// <summary>
    /// Used for Excel export and MapService (heatmap / overview / stuffs)
    /// </summary>
    public class Map
    {
        /// <summary>
        /// Map's name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Number of pixels X
        /// </summary>
        public int ResolutionX { get; set; } = 1024;

        /// <summary>
        /// Number of pixels Y
        /// </summary>
        public int ResolutionY { get; set; } = 1024;

        /// <summary>
        /// Upper left world coordinate (see map's .txt file in csgo\resource\overviews)
        /// </summary>
        public int PosX { get; set; }

        /// <summary>
        /// Bottom right world coordinate (see map's .txt file in csgo\resource\overviews)
        /// </summary>
        public int PosY { get; set; }

        /// <summary>
        /// Map's scaling (see map's .txt file in csgo\resource\overviews)
        /// </summary>
        public double Scale { get; set; }

        /// <summary>
        /// Number of matchs played on this map
        /// </summary>
        public int MatchCount { get; set; } = 0;

        /// <summary>
        /// Number of rounds played on this map
        /// </summary>
        public int RoundCount { get; set; } = 0;

        /// <summary>
        /// Number of round won by the T
        /// </summary>
        public int WinTerroristCount { get; set; } = 0;

        /// <summary>
        /// Number of round won by the T
        /// </summary>
        public int WinCounterTerroritsCount { get; set; } = 0;

        /// <summary>
        /// Number of round won when a team was on eco
        /// </summary>
        public int WinEcoRoundCount { get; set; } = 0;

        /// <summary>
        /// Number of round won when a team was on semi-eco
        /// </summary>
        public int WinSemiEcoCount { get; set; } = 0;

        /// <summary>
        /// Number of round won when a team was on pistol round
        /// </summary>
        public int WinPistolRoundCount { get; set; } = 0;

        /// <summary>
        /// Number of round won when a team was on force buy
        /// </summary>
        public int WinForceBuyCount { get; set; } = 0;

        /// <summary>
        /// Number of bomb defused
        /// </summary>
        public int BombDefusedCount { get; set; } = 0;

        /// <summary>
        /// Number of bomb planted
        /// </summary>
        public int BombPlantedCount { get; set; } = 0;

        /// <summary>
        /// Number of bomb exploded
        /// </summary>
        public int BombExplodedCount { get; set; } = 0;

        /// <summary>
        /// Number of bomb planted on A
        /// </summary>
        public int BombPlantedOnACount { get; set; } = 0;

        /// <summary>
        /// Number of bomb planted on B
        /// </summary>
        public int BombPlantedOnBCount { get; set; } = 0;

        public override bool Equals(object obj)
        {
            var item = obj as Map;

            return item != null && Name.Equals(item.Name);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
}
