using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class ExplosiveNadeExplodedEvent : NadeBaseEvent
	{
		[JsonIgnore]
		public override string Message => "HE grenade exploded";

		public ExplosiveNadeExplodedEvent(int tick)
			: base(tick)
		{
		}
	}
}
