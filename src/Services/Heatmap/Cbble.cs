namespace CSGO_Demos_Manager.Services.Heatmap
{
	public class Cbble : HeatmapService
	{
		public Cbble()
		{
			StartX = -3819;
			StartY = -3073;
			EndX = 2282;
			EndY = 3032;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_cbble;
			OverviewImageData = Properties.Resources.de_cbble_base64;
			CalcSize();
		}
	}
}