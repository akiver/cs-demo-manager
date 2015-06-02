using DemoInfo;

namespace CSGO_Demos_Manager.Models
{
	public class HeatmapPoint : MapPoint
	{
		public byte Intensity { get; set; } = 100;

		public PlayerExtended Player { get; set; }

		public Round Round { get; set; }

		public Team Team { get; set; }

		public HeatmapPoint Clone()
		{
			return (HeatmapPoint)MemberwiseClone();
		}
	}
}
