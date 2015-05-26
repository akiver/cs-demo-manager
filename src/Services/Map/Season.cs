namespace CSGO_Demos_Manager.Services.Map
{
	public class Season : MapService
	{
		public Season()
		{
			MapName = "de_season";
			StartX = -985;
			StartY = -2604;
			EndX = 4122;
			EndY = 2500;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_season;
			OverviewImageData = Properties.Resources.de_season_base64;
			CalcSize();
		}
	}
}