namespace CSGO_Demos_Manager.Services.Map
{
	public class Coast : MapService
	{
		public Coast()
		{
			MapName = "de_coast";
			StartX = -3019;
			StartY = -1540;
			EndX = 2596;
			EndY = 4137;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_coast;
			CalcSize();
		}
	}
}
