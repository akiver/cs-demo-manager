namespace CSGO_Demos_Manager.Services.Map
{
	public class Cache : MapService
	{
		public Cache()
		{
			MapName = "de_cache";
			StartX = -2281;
			StartY = -2155;
			EndX = 3370;
			EndY = 3426;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_cache;
			OverviewImageData = Properties.Resources.de_cache_base64;
			CalcSize();
		}
	}
}