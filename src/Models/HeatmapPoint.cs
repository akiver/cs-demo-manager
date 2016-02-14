using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models
{
	public class HeatmapPoint : MapPoint
	{
		[JsonIgnore]
		public byte Intensity { get; set; } = 100;
	}
}
