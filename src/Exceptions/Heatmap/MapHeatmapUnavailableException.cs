namespace CSGO_Demos_Manager.Exceptions.Heatmap
{
	public class MapHeatmapUnavailableException : HeatmapException
	{
		public MapHeatmapUnavailableException()
			: base("This map doesn't support heatmap feature.")
		{
		}
	}
}
