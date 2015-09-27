using System.Collections.Generic;
using CSGO_Demos_Manager.Models.Charts;

namespace CSGO_Demos_Manager.Models.Stats
{
	public class ProgressStats
	{
		public List<HeadshotDateChart> HeadshotRatio { get; set; }

		public List<DamageDateChart> Damage { get; set; }

		public List<WinDateChart> Win { get; set; }

		public List<KillDateChart> Kill { get; set; }
	}
}