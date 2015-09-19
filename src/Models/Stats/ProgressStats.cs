using System.Collections.Generic;
using CSGO_Demos_Manager.Models.Charts;

namespace CSGO_Demos_Manager.Models.Stats
{
	public class ProgressStats
	{
		public List<GenericDateChart> HeadshotRatio { get; set; }

		public List<GenericDateChart> Damage { get; set; }

		public List<GenericDateChart> Win { get; set; }

		public List<GenericDateChart> Kill { get; set; }
	}
}