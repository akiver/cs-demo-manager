using System.Collections.Generic;

namespace CSGO_Demos_Manager.Models
{
	public enum StuffType
	{
		SMOKE = 0,
		FLASHBANG = 1,
		HE = 2,
		MOLOTOV = 3,
		INCENDIARY = 4,
		DECOY = 5,
		UNKNOWN = 6
	}

	public class Stuff
	{
		public StuffType Type { get; set; }

		public int Tick { get; set; }

		public int RoundNumber { get; set; }

		public string ThrowerName { get; set; }

		public long ThrowerSteamId { get; set; }

		public float StartX { get; set; }

		public float StartY { get; set; }

		public float EndX { get; set; }

		public float EndY { get; set; }

		public List<PlayerExtended> FlashedPlayers { get; set; }
	}
}
