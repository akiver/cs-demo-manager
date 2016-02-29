namespace CSGO_Demos_Manager.Services.Map
{
	public class Empire : MapService
	{
		public Empire()
		{
			MapName = "de_empire";
			StartX = -1390;
			StartY = -2633;
			EndX = 1701;
			EndY = 2072;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_empire;
			CalcSize();
		}
	}
}
