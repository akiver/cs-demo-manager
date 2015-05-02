namespace CSGO_Demos_Manager.Services.Heatmap
{
	public class Inferno : HeatmapService
	{
		public Inferno()
		{
			StartX = -2222;
			StartY = -1649;
			EndX = 3861;
			EndY = 4408;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_inferno;
			OverviewImageData = Properties.Resources.de_inferno_base64;
			CalcSize();
		}
	}
}
