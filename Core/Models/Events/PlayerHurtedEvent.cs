using Core.Models.Serialization;
using DemoInfo;
using Newtonsoft.Json;

namespace Core.Models.Events
{
	public class PlayerHurtedEvent : BaseEvent
	{
		public PlayerHurtedEvent(int tick, float seconds) : base(tick, seconds) { }

		[JsonProperty("hurted_steamid")]
		[JsonConverter(typeof(LongToStringConverter))]
		public long HurtedSteamId { get; set; }

		[JsonProperty("attacker_steamid")]
		[JsonConverter(typeof(LongToStringConverter))]
		public long AttackerSteamId { get; set; }

		[JsonProperty("attacker_side")]
		[JsonConverter(typeof(SideToStringConverter))]
		public Side AttackerSide { get; set; }

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

		[JsonProperty("victim_x")]
		public float VictimX{ get; set; }

		[JsonProperty("victim_y")]
		public float VictimY { get; set; }

		[JsonProperty("attacker_x")]
		public float AttackerX { get; set; }

		[JsonProperty("attacker_y")]
		public float AttackerY { get; set; }
	}
}