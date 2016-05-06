namespace CSGO_Demos_Manager.Services.Map
{
	public class Cache : MapService
	{
		public Cache()
		{
			MapName = "de_cache";
			StartX = -2031;
			StartY = -2240;
			EndX = 3752;
			EndY = 3187;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_cache;
			CalcSize();
		}
	}
}