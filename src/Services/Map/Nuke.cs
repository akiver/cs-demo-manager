namespace CSGO_Demos_Manager.Services.Map
{
	public class Nuke : MapService
	{
		public Nuke()
		{
			MapName = "de_nuke";
			StartX = -3082;
			StartY = -4464;
			EndX = 3516;
			EndY = 2180;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_nuke;
			CalcSize();
		}
	}
}