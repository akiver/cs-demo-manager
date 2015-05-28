using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class DecoyEndedEvent : NadeBaseEvent
	{
		[JsonIgnore]
		public override string Message => "Decoy exploded";

		public DecoyEndedEvent(int tick)
			: base(tick)
		{
		}
	}
}