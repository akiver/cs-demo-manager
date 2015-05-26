namespace CSGO_Demos_Manager.Models.Events
{
	public class WeaponFire : BaseEvent
	{
		public float X { get; set; }

		public float Y { get; set; }

		public float Z { get; set; }

		public PlayerExtended Shooter { get; set; }

		public Weapon Weapon { get; set; }

		public override string Message => Shooter.Name + " throwed " + Weapon.Name;

		public WeaponFire(int tick) : base(tick)
		{
		}
	}
}
