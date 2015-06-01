namespace CSGO_Demos_Manager.Models
{
	public class HeatmapPoint : MapPoint
	{
		public byte Intensity { get; set; } = 100;

		public HeatmapPoint Clone()
		{
			return (HeatmapPoint)MemberwiseClone();
		}
	}
}
