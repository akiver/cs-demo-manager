namespace CSGO_Demos_Manager.Models
{
	public class HeatmapPoint : MapPoint
	{
		public int Value { get; set; }

		public HeatmapPoint Clone()
		{
			return (HeatmapPoint)MemberwiseClone();
		}
	}
}
