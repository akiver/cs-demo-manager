namespace CSGO_Demos_Manager.Services.Map
{
	public class Overpass : MapService
	{
		public Overpass()
		{
			MapName = "de_overpass";
			StartX = -4820;
			StartY = -3591;
			EndX = 503;
			EndY = 1740;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_overpass;
			CalcSize();
		}
	}
}