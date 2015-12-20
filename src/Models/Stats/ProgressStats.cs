using System.Collections.Generic;
using CSGO_Demos_Manager.Models.Charts;

namespace CSGO_Demos_Manager.Models.Stats
{
	public class ProgressStats
	{
		public List<HeadshotDateChart> HeadshotRatio { get; set; } = new List<HeadshotDateChart>();

		public List<DamageDateChart> Damage { get; set; } = new List<DamageDateChart>();

		public List<WinDateChart> Win { get; set; } = new List<WinDateChart>();

		public List<KillDateChart> Kill { get; set; } = new List<KillDateChart>();

		public List<KillVelocityChart> KillVelocityRifle { get; set; } = new List<KillVelocityChart>();

		public List<KillVelocityChart> KillVelocitySniper { get; set; } = new List<KillVelocityChart>();

		public List<KillVelocityChart> KillVelocityPistol { get; set; } = new List<KillVelocityChart>();

		public List<KillVelocityChart> KillVelocitySmg { get; set; } = new List<KillVelocityChart>();

		public List<KillVelocityChart> KillVelocityHeavy { get; set; } = new List<KillVelocityChart>();

		public double MaximumVelocity { get; set; } = 250;

		public List<CrouchKillDateChart> CrouchKill { get; set; } = new List<CrouchKillDateChart>();
	}
}