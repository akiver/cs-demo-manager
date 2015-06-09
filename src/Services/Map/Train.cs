namespace CSGO_Demos_Manager.Services.Map
{
	public class Train : MapService
	{
		public Train()
		{
			MapName = "de_train";
			StartX = -2436;
			StartY = -2469;
			EndX = 2262;
			EndY = 2447;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_train;
			CalcSize();
		} 
	}
}