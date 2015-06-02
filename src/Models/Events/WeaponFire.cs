using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class WeaponFire : BaseEvent
	{
		[JsonIgnore]
		public HeatmapPoint Point { get; set; }

		public PlayerExtended Shooter { get; set; }

		public Weapon Weapon { get; set; }

		public override string Message => Shooter.Name + " throwed " + Weapon.Name;

		public WeaponFire(int tick) : base(tick)
		{
		}
	}
}
