namespace CSGO_Demos_Manager.Services.Map
{
	public class Santorini : MapService
	{
		public Santorini()
		{
			MapName = "de_santorini";
			StartX = -2114;
			StartY = -2710;
			EndX = 1949;
			EndY = 1415;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_santorini;
			CalcSize();
		}
	}
}
