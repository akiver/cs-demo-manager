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
		/// Scaled X size
		/// </summary>
		public int SizeX { get; set; }

		/// <summary>
		/// Scaled Y size
		/// </summary>
		public int SizeY { get; set; }

		/// <summary>
		/// X Coordinate where the map start in game (getpos_exact)
		/// </summary>
		public int StartX { get; set; }

		/// <summary>
		/// X Coordinate where the map start in game (getpos_exact)
		/// </summary>
		public int StartY { get; set; }

		/// <summary>
		/// X Coordinate where the map end in game (getpos_exact)
		/// </summary>
		public int EndX { get; set; }

		/// <summary>
		/// Y Coordinate where the map end in game (getpos_exact)
		/// </summary>
		public int EndY { get; set; }

		/// <summary>
		/// Pixel dimensions of the overview image (width)
		/// </summary>
		public int ResX { get; set; }

		/// <summary>
		/// Pixel dimensions of the overview image (height)
		/// </summary>
		public int ResY { get; set; }

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

		/// <summary>
		/// Compute the overview size (scaling)
		/// </summary>
		protected void CalcSize()
		{
			SizeX = EndX - StartX;
			SizeY = EndY - StartY;
		}

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
