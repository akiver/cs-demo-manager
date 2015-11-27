using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class KillEvent : BaseEvent
	{
		[JsonProperty("killer")]
		public PlayerExtended Killer { get; set; }

		[JsonProperty("victim")]
		public PlayerExtended DeathPerson { get; set; }

		[JsonProperty("assister")]
		public PlayerExtended Assister { get; set; }

		[JsonProperty("weapon")]
		public Weapon Weapon { get; set; }

		[JsonIgnore]
		public KillHeatmapPoint Point { get; set; }

		[JsonIgnore]
		public override string Message => Killer.Name + " killed " + DeathPerson.Name + " with " + Weapon.Name;

		public KillEvent(int tick)
			: base(tick)
		{
		}
	}
}
