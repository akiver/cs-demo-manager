using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class PlayerHurtedEvent : BaseEvent
	{
		public PlayerHurtedEvent(int tick, float seconds) : base(tick, seconds) { }

		[JsonProperty("hurted_steamid")]
		public long HurtedSteamId { get; set; }

		[JsonProperty("attacker_steamid")]
		public long AttackerSteamId { get; set; }

		[JsonProperty("attacker_side")]
		public Team AttackerSide { get; set; }

		[JsonProperty("armor_damage")]
		public int ArmorDamage { get; set; }

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