namespace Services.Exceptions.Map
{
	public class HeatmapDataNotFoundException : MapException
	{
		public HeatmapDataNotFoundException(string message) :
			base(message)
		{
		}
	}
}
