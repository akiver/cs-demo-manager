namespace CSGO_Demos_Manager.Models.Events
{
	public class WeaponFire : BaseEvent
	{
		public float X { get; set; }

		public float Y { get; set; }

		public float Z { get; set; }

		public WeaponFire(int tick) : base(tick)
		{
		}
	}
}
