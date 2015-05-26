namespace CSGO_Demos_Manager.Models.Events
{
	public class MolotovFireEndedEvent : NadeBaseEvent
	{
		public override string Message => "Molotov ended";

		public MolotovFireEndedEvent(int tick)
			: base(tick)
		{
		}
	}
}
