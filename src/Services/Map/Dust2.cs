namespace CSGO_Demos_Manager.Services.Map
{
	public class Dust2 : MapService
	{
		public Dust2()
		{
			MapName = "de_dust2";
			StartX = -2486;
			StartY = -1150;
			EndX = 2127;
			EndY = 3455;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_dust2;
			CalcSize();
		}
	}
}
