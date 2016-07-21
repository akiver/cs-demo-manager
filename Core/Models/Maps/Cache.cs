namespace Core.Models.Maps
{
	public class Cache : Map
	{
		public Cache()
		{
			Name = "de_cache";
			StartX = -2031;
			StartY = -2240;
			EndX = 3752;
			EndY = 3187;
			ResX = 1024;
			ResY = 1024;
			CalcSize();
		}
	}
}