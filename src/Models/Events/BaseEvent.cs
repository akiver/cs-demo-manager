using GalaSoft.MvvmLight;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BaseEvent : ObservableObject
	{
		public int Tick { get; set; }

		public virtual string Message { get; set; }

		public BaseEvent(int tick)
		{
			Tick = tick;
		}
	}
}
