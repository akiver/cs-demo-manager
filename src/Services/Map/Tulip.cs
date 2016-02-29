namespace CSGO_Demos_Manager.Services.Map
{
	public class Tulip : MapService
	{
		public Tulip()
		{
			MapName = "de_tulip";
			StartX = 3418;
			StartY = -64;
			EndX = 9022;
			EndY = 5594;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_tulip;
			CalcSize();
		}
	}
}
