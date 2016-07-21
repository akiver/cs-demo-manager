namespace Core.Models.Maps
{
	public class Overpass : Map
	{
		public Overpass()
		{
			Name = "de_overpass";
			StartX = -4820;
			StartY = -3591;
			EndX = 503;
			EndY = 1740;
			ResX = 1024;
			ResY = 1024;
			CalcSize();
		}
	}
}