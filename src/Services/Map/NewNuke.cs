namespace CSGO_Demos_Manager.Services.Map
{
	public class NewNuke : MapService
	{
		public NewNuke()
		{
			//OK
			MapName = "de_new_nuke";
			StartX = -3427;
			StartY = -4302;
			EndX = 3681;
			EndY = 2896;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_new_nuke;
			CalcSize();
		}
	}
}
