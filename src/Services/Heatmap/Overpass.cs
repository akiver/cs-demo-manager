namespace CSGO_Demos_Manager.Services.Heatmap
{
	public class Overpass : HeatmapService
	{
		public Overpass()
		{
			StartX = -4820;
			StartY = -3591;
			EndX = 503;
			EndY = 1740;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_overpass;
			OverviewImageData = Properties.Resources.de_overpass_base64;
			CalcSize();
		}
	}
}