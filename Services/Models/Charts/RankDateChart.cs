using System;

namespace Services.Models.Charts
{
	public class RankDateChart
	{
		public double OldRank { get; set; }
		public double NewRank { get; set; }
		public double WinCount { get; set; }
		public DateTime Date { get; set; }
		public int WinStatus { get; set; }
	}
}