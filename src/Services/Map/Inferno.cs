namespace CSGO_Demos_Manager.Services.Map
{
	public class Inferno : MapService
	{
		public Inferno()
		{
			MapName = "de_inferno";
			StartX = -2222;
			StartY = -1649;
			EndX = 3861;
			EndY = 4408;
			ResX = 1024;
			ResY = 1024;
			Overview = Properties.Resources.de_inferno;
			OverviewImageData = Properties.Resources.de_inferno_base64;
			CalcSize();
		}
	}
}
