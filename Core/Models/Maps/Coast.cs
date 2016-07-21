namespace Core.Models.Maps
{
	public class Coast : Map
	{
		public Coast()
		{
			Name = "de_coast";
			StartX = -3019;
			StartY = -1540;
			EndX = 2596;
			EndY = 4137;
			ResX = 1024;
			ResY = 1024;
			CalcSize();
		}
	}
}
