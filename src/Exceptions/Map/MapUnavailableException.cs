namespace CSGO_Demos_Manager.Exceptions.Map
{
	public class MapUnavailableException : MapException
	{
		public MapUnavailableException()
			: base("This map doesn't support this feature.")
		{
		}
	}
}
