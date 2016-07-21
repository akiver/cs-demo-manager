namespace Core.Models.Maps
{
	public class Train : Map
	{
		public Train()
		{
			Name = "de_train";
			StartX = -2436;
			StartY = -2469;
			EndX = 2262;
			EndY = 2447;
			ResX = 1024;
			ResY = 1024;
			CalcSize();
		} 
	}
}