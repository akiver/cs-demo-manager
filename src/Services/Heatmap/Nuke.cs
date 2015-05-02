namespace CSGO_Demos_Manager.Services.Heatmap
{
	public class Nuke : HeatmapService
	{
		public Nuke()
		{
			StartX = -3082;
			StartY = -4464;
			EndX = 3516;
			EndY = 2180;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_nuke;
			OverviewImageData = Properties.Resources.de_nuke_base64;
			CalcSize();
		}
	}
}