using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class DecoyStartedEvent : NadeBaseEvent
	{
		[JsonIgnore]
		public override string Message => "Decoy started";

		public DecoyStartedEvent(int tick)
			: base(tick)
		{
		}
	}
}