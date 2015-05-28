using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class MolotovFireStartedEvent : NadeBaseEvent
	{
		[JsonIgnore]
		public override string Message => "Molotov started";

		public MolotovFireStartedEvent(int tick)
			: base(tick)
		{
		}
	}
}