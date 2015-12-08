using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class WeaponFire : BaseEvent
	{
		[JsonIgnore]
		public HeatmapPoint Point { get; set; }

		[JsonProperty("shooter")]
		public PlayerExtended Shooter { get; set; }

		[JsonProperty("weapon")]
		public Weapon Weapon { get; set; }

		[JsonProperty("round")]
		public Round Round { get; set; }

		[JsonProperty("shooter_velocity_x")]
		public float ShooterVelocityX { get; set; }

		[JsonProperty("shooter_velocity_y")]
		public float ShooterVelocityY { get; set; }

		[JsonProperty("shooter_velocity_z")]
		public float ShooterVelocityZ { get; set; }

		public override string Message => Shooter.Name + " throwed " + Weapon.Name;

		public WeaponFire(int tick) : base(tick)
		{
		}
	}
}
