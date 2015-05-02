namespace CSGO_Demos_Manager.Services.Heatmap
{
	public class Mirage : HeatmapService
	{
		public Mirage()
		{
			StartX = -3217;
			StartY = -3401;
			EndX = 1912;
			EndY = 1682;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_mirage;
			OverviewImageData = Properties.Resources.de_mirage_base64;
			CalcSize();
		}
	}
}