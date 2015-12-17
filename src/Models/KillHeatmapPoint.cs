using DemoInfo;

namespace CSGO_Demos_Manager.Models
{
	public class KillHeatmapPoint : HeatmapPoint
	{
		public float KillerX { get; set; }

		public float KillerY { get; set; }

		public float VictimX { get; set; }

		public float VictimY { get; set; }

		public long KillerSteamId { get; set; }

		public string KillerName { get; set; }

		public long VictimSteamId { get; set; }

		public string VictimName { get; set; }

		public Team KillerTeam { get; set; }

		public Team VictimTeam { get; set; }

		public override bool Equals(object obj)
		{
			var item = (KillHeatmapPoint)obj;

			if (item == null) return false;

			return KillerX.Equals(item.KillerX)
				&& KillerY.Equals(item.KillerY)
				&& VictimX.Equals(item.VictimX)
				&& VictimY.Equals(item.VictimY);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}
	}
}