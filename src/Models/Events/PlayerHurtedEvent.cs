using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class PlayerHurtedEvent : BaseEvent
	{
		public PlayerHurtedEvent(int tick) : base(tick)
		{
		}

		[JsonProperty("defuser")]
		public PlayerExtended Hurted { get; set; }

		[JsonProperty("attacker")]
		public PlayerExtended Attacker { get; set; }

		[JsonProperty("armor")]
		public int Armor { get; set; }

		[JsonProperty("armor_damage")]
		public int ArmorDamage { get; set; }

		[JsonProperty("health")]
		public int Health { get; set; }

		[JsonProperty("health_damage")]
		public int HealthDamage { get; set; }

		[JsonProperty("hitgroup")]
		public Hitgroup HitGroup { get; set; }

		[JsonProperty("weapon")]
		public Weapon Weapon { get; set; }

		[JsonProperty("round_number")]
		public int RoundNumber { get; set; }
	}
}