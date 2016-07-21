namespace Core.Models.Maps
{
	public class Season : Map
	{
		public Season()
		{
			Name = "de_season";
			StartX = -985;
			StartY = -2604;
			EndX = 4122;
			EndY = 2500;
			ResX = 1024;
			ResY = 1024;
			CalcSize();
		}
	}
}