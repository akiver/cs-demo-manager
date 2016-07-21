namespace Core.Models.Maps
{
	public class Empire : Map
	{
		public Empire()
		{
			Name = "de_empire";
			StartX = -1390;
			StartY = -2633;
			EndX = 1701;
			EndY = 2072;
			ResX = 1024;
			ResY = 1024;
			CalcSize();
		}
	}
}
