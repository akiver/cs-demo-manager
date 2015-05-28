using GalaSoft.MvvmLight;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BaseEvent : ObservableObject
	{
		[JsonProperty("tick")]
		public int Tick { get; set; }

		[JsonIgnore]
		public virtual string Message { get; set; }

		public BaseEvent(int tick)
		{
			Tick = tick;
		}
	}
}
