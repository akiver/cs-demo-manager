namespace CSGO_Demos_Manager.Services.Map
{
	public class Royal : MapService
	{
		public Royal()
		{
			MapName = "de_royal";
			StartX = -2331;
			StartY = -1459;
			EndX = 1737;
			EndY = 2626;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_royal;
			CalcSize();
		}
	}
}
