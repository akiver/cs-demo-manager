namespace CSGO_Demos_Manager.Services.Heatmap
{
	public class Dust2 : HeatmapService
	{
		public Dust2()
		{
			StartX = -2486;
			StartY = -1150;
			EndX = 2127;
			EndY = 3455;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_dust2;
			OverviewImageData = Properties.Resources.de_dust2_base64;
			CalcSize();
		}
	}
}
