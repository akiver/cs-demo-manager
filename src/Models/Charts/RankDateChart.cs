using System;

namespace CSGO_Demos_Manager.Models.Charts
{
	public class RankDateChart
	{
		public double OldRank { get; set; }
		public double NewRank { get; set; }
		public double WinCount { get; set; }
		public DateTime Date { get; set; }
	}
}