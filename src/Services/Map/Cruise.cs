namespace CSGO_Demos_Manager.Services.Map
{
	public class Cruise : MapService
	{
		public Cruise()
		{
			MapName = "cs_cruise";
			StartX = -3465;
			StartY = -2692;
			EndX = 1583;
			EndY = 2275;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.cs_cruise;
			CalcSize();
		}
	}
}
