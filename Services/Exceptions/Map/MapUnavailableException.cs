namespace Services.Exceptions.Map
{
	public class MapUnavailableException : MapException
	{
		public MapUnavailableException(string mapName)
			: base("The map " + mapName + " doesn't support this feature.")
		{
		}
	}
}
